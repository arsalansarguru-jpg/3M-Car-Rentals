import { NextResponse, type NextRequest } from "next/server";
import { AuthService } from "@/services/auth.service";
import { ProfileService } from "@/services/profile.service";
import { RoleService } from "@/services/role.service";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    try {
      const supabase = await AuthService.getServerClient();
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
        
        // Propagate authentication cookies from server client state onto the redirect response
        const dummyResponse = NextResponse.next();
        const client = await AuthService.getServerClient(); // fetch initialized server instance to extract cookies
        
        // Grab current cookie jar to carry session headers onto redirect header payload
        request.cookies.getAll().forEach((cookie) => {
          if (cookie.name.startsWith("sb-")) {
            redirectResponse.cookies.set(cookie.name, cookie.value, {
              path: "/",
              secure: true,
              sameSite: "lax",
            });
          }
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
