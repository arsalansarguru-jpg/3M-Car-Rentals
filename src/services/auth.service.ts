import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type SupabaseClient } from "@supabase/supabase-js";

export interface ResolvedUser {
  user: any;
  profile: any;
  role: string;
}

export class AuthService {
  /**
   * Instantiates and returns a server-side Supabase client using Next.js async cookies context.
   */
  static async getServerClient() {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env variables.");
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored if called inside Server Components during navigation
          }
        },
      },
    });
  }

  /**
   * Resolves the current authenticated user and their DB profile / role in a unified utility.
   * Caches results if multiple calls are made during the lifecycle of the request.
   */
  static async getCurrentUser(client?: SupabaseClient): Promise<ResolvedUser | null> {
    try {
      const supabase = client || (await AuthService.getServerClient());
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return null;
      }

      // Query profile and join role in a single call
      const { data: profile, error: dbError } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, phone, status, role:roles(name)")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (dbError) {
        console.error(`[AuthService] Profile query error for authenticated user (${user.email}):`, dbError);
      }

      const role = (profile as any)?.role?.name || "customer";

      return {
        user,
        profile,
        role,
      };
    } catch (err) {
      console.error("[AuthService] Unexpected error resolving current user context:", err);
      return null;
    }
  }

  /**
   * Performs structured server-side sign out.
   */
  static async signOut(client?: SupabaseClient): Promise<void> {
    try {
      const supabase = client || (await AuthService.getServerClient());
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[AuthService] Supabase signOut error:", error.message);
        throw error;
      }
      console.log("[AuthService] [AUTH_EVENT] Session terminated successfully.");
    } catch (err) {
      console.error("[AuthService] Sign out exception:", err);
      throw err;
    }
  }
}
