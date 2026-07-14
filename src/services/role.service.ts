import { SupabaseClient } from "@supabase/supabase-js";

export class RoleService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetches a role record from the database by its name.
   */
  async getRoleByName(name: string) {
    const { data, error } = await this.supabase
      .from("roles")
      .select("*")
      .eq("name", name)
      .maybeSingle();

    if (error) {
      console.error(`[RoleService] Database query error fetching role by name (${name}):`, {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw error;
    }
    return data;
  }

  /**
   * Resolves the role name of a user from their auth UID.
   * If the profile does not exist, returns the default "customer" role.
   */
  async getUserRole(authUserId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("users")
      .select("role:roles(name)")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      console.error(`[RoleService] Database query error resolving user role (AuthID: ${authUserId}):`, {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      return "customer"; // Fail-safe fallback to customer
    }

    const roleName = (data as any)?.role?.name;
    if (!roleName) {
      console.warn(`[RoleService] Profile resolved but role name was empty for AuthID: ${authUserId}. Defaulting to 'customer'.`);
      return "customer";
    }

    return roleName;
  }

  /**
   * Helper to verify if a resolved role name has admin privileges.
   */
  static isAdminRole(roleName: string): boolean {
    return ["admin", "super_admin", "manager", "staff"].includes(roleName);
  }

  /**
   * Helper to verify if a resolved role name has staff/ops privileges.
   */
  static isStaffRole(roleName: string): boolean {
    return ["staff", "manager", "admin", "super_admin"].includes(roleName);
  }
}
