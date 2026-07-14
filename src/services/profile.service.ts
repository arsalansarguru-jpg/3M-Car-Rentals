import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Retrieves a user profile by their auth UUID.
   */
  async getProfile(authUserId: string) {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      console.error(`[ProfileService] Database query error retrieving profile (AuthID: ${authUserId}):`, {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw error;
    }
    return data;
  }

  /**
   * Idempotently ensures that a user profile exists in the 'users' table.
   * Leverages the service-role client to insert if missing, and catches
   * unique constraint collisions from concurrent requests.
   */
  async ensureProfileExists(user: any): Promise<any> {
    const authUserId = user.id;

    // 1. Attempt lookup under current connection
    const { data: existingProfile, error: selectError } = await this.supabase
      .from("users")
      .select("id, role_id, role:roles(name)")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (selectError) {
      console.error(`[ProfileService] Warning: Error checking profile presence for AuthID ${authUserId}:`, selectError.message);
    }

    if (existingProfile) {
      return existingProfile;
    }

    // 2. Profile missing, initiate secure creation via admin client
    console.log(`[ProfileService] [AUTH_EVENT] Profile missing for user ${user.email} (AuthID: ${authUserId}). Initiating secure creation.`);
    
    try {
      const { data: customerRole, error: roleError } = await supabaseAdmin
        .from("roles")
        .select("id")
        .eq("name", "customer")
        .maybeSingle();

      if (roleError || !customerRole) {
        console.error(`[ProfileService] Critical database configuration error - 'customer' role not found:`, roleError);
        throw new Error("Missing required default role configurations in database.");
      }

      const metadata = user.user_metadata || {};
      const nameParts = (metadata.full_name || metadata.name || "").split(" ");
      const firstName = metadata.first_name || nameParts[0] || user.email?.split("@")[0] || "Guest";
      const lastName = metadata.last_name || nameParts.slice(1).join(" ") || "Member";

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          auth_user_id: authUserId,
          first_name: firstName,
          last_name: lastName,
          email: user.email!,
          phone: user.phone || null,
          role_id: customerRole.id,
          status: "active",
        })
        .select("id, role_id, role:roles(name)")
        .maybeSingle();

      if (insertError) {
        // Handle postgres unique constraint validation collision (23505)
        if (insertError.code === "23505") {
          console.log(`[ProfileService] [CONCURRENCY_EVENT] Profile insertion conflict detected for user ${user.email}. Resolving conflict and querying existing row.`);
          
          const { data: resolvedProfile, error: retryError } = await this.supabase
            .from("users")
            .select("id, role_id, role:roles(name)")
            .eq("auth_user_id", authUserId)
            .maybeSingle();

          if (retryError || !resolvedProfile) {
            console.error(`[ProfileService] Failed resolving concurrent profile row query:`, retryError);
            throw insertError;
          }
          return resolvedProfile;
        }

        console.error(`[ProfileService] Database insert error creating profile:`, insertError);
        throw insertError;
      }

      console.log(`[ProfileService] [AUTH_EVENT] Profile successfully created for user ${user.email} (AuthID: ${authUserId}).`);
      return newProfile;
    } catch (err) {
      console.error(`[ProfileService] Unexpected exception inside ensureProfileExists for ${user.email}:`, err);
      throw err;
    }
  }
}
