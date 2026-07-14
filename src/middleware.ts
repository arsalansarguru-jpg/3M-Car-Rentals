import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // Helper redirect function to preserve cookie/session headers
  const redirect = (redirectUrl: string | URL) => {
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        expires: cookie.expires,
        maxAge: cookie.maxAge,
      });
    });
    return redirectResponse;
  };

  // Redirect legacy auth endpoints
  if (url.pathname === "/auth/login") {
    url.pathname = "/login";
    return redirect(url);
  }
  if (url.pathname === "/auth/register") {
    url.pathname = "/signup";
    return redirect(url);
  }

  // 1. Guard protected path groups: /dashboard/* and /admin/*
  const isDashboardRoute = url.pathname.startsWith("/dashboard");
  const isAdminRoute = url.pathname.startsWith("/admin") && url.pathname !== "/admin/login";

  if (isDashboardRoute || isAdminRoute) {
    if (!user) {
      console.log(`[Middleware] [UNAUTHORIZED] Blocking access to ${url.pathname}. Redirecting to /login.`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", url.pathname + url.search);
      return redirect(loginUrl);
    }
  }

  // 2. Redirect authenticated users away from auth portals
  const isAuthPortal = url.pathname === "/login" || url.pathname === "/signup" || url.pathname === "/admin/login";
  if (isAuthPortal && user) {
    // Note: Database role resolution is moved out of middleware.
    // Authenticated users hitting guest paths are routed to `/dashboard`.
    // The dashboard pages/layouts will evaluate roles and redirect admins if needed.
    const destination = url.pathname === "/admin/login" ? "/admin" : "/dashboard";
    console.log(`[Middleware] [AUTH_EVENT] Authenticated user ${user.email} attempted to visit auth page. Redirecting to ${destination}.`);
    return redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/auth/login",
    "/auth/register",
  ],
};
