import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ProfileService } from "@/services/profile.service";
import { RoleService } from "@/services/role.service";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    try {
      const cookieStore = await cookies();
      
      // Create a dummy response to capture cookies set during code exchange
      const response = NextResponse.next();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error && data?.user) {
        const user = data.user;
        console.log(`[AuthCallback] [AUTH_EVENT] Authorization code exchanged successfully for user: ${user.email}`);

        // 1. Idempotently ensure user profile exists in database
        const profileService = new ProfileService(supabase);
        await profileService.ensureProfileExists(user);

        // 2. Resolve user role via RoleService
        const roleService = new RoleService(supabase);
        const roleName = await roleService.getUserRole(user.id);

        const isAdmin = RoleService.isAdminRole(roleName);
        const redirectDestination = isAdmin ? "/admin" : next;

        console.log(`[AuthCallback] [REDIRECT_EVENT] Redirecting authenticated user ${user.email} (Role: ${roleName}) to: ${redirectDestination}`);
        
        const redirectResponse = NextResponse.redirect(new URL(redirectDestination, request.url));
        
        // Propagate authentication cookies from captured state onto the redirect response
        response.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, {
            path: cookie.path || "/",
            domain: cookie.domain,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
            expires: cookie.expires,
            maxAge: cookie.maxAge,
          });
        });

        return redirectResponse;
      } else if (error) {
        console.error("[AuthCallback] [AUTH_FAILURE] Code exchange verification failed:", {
          message: error.message,
          status: error.status,
        });
      }
    } catch (err) {
      console.error("[AuthCallback] [EXCEPTION] Uncaught exception during exchange:", err);
    }
  }

  // Fallback redirect on verification failure
  console.warn("[AuthCallback] [REDIRECT_EVENT] Auth callback failed. Redirecting to /login with error query.");
  return NextResponse.redirect(new URL("/login?error=AuthCallbackError", request.url));
}
