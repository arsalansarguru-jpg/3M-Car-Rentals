import { redirect } from "next/navigation";
import { AuthService, type ResolvedUser } from "./auth.service";
import { RoleService } from "./role.service";

/**
 * Enforces that a user is fully authenticated.
 * If no valid session is present, redirects them directly to the sign-in portal.
 */
export async function requireAuth(): Promise<ResolvedUser> {
  const resolved = await AuthService.getCurrentUser();
  
  if (!resolved) {
    console.warn("[AuthHelper] [UNAUTHORIZED] Attempt to access protected resource with missing or expired session. Redirecting to /login.");
    redirect("/login");
  }
  
  return resolved;
}

/**
 * Restricts page/layout access exclusively to Customer users.
 * - Redirects guest users to /login.
 * - Redirects admin/staff users to the /admin control center.
 */
export async function requireCustomer(): Promise<ResolvedUser> {
  const resolved = await requireAuth();
  
  if (RoleService.isAdminRole(resolved.role)) {
    console.log(`[AuthHelper] [REDIRECT_EVENT] Admin user (${resolved.user.email}) accessed customer route. Redirecting to /admin.`);
    redirect("/admin");
  }
  
  return resolved;
}

/**
 * Restricts page/layout access exclusively to Administrator users.
 * - Redirects guest users to /login.
 * - Redirects customer users to the client /dashboard.
 */
export async function requireAdmin(): Promise<ResolvedUser> {
  const resolved = await requireAuth();
  
  if (!RoleService.isAdminRole(resolved.role)) {
    console.warn(`[AuthHelper] [AUTHORIZATION_FAILURE] Customer user (${resolved.user.email}) attempted to access admin layout. Redirecting to /dashboard.`);
    redirect("/dashboard");
  }
  
  return resolved;
}

/**
 * Restricts page/layout access to Staff, Manager, or Admin personnel.
 * - Redirects guest users to /login.
 * - Redirects customer users to the client /dashboard.
 */
export async function requireStaff(): Promise<ResolvedUser> {
  const resolved = await requireAuth();
  
  if (!RoleService.isStaffRole(resolved.role)) {
    console.warn(`[AuthHelper] [AUTHORIZATION_FAILURE] User (${resolved.user.email}) lacks staff permissions. Redirecting to /dashboard.`);
    redirect("/dashboard");
  }
  
  return resolved;
}
