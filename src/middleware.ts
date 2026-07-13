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

  // 1. Protecting Admin routes (/admin/*, excluding /admin/login)
  if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login") {
    if (!user) {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role:roles(name)")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const roleName = (userData as any)?.role?.name || "";
    const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);

    if (!isAdmin) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 2. Protecting Customer Dashboard routes (/dashboard/* and /dashboard itself)
  if (url.pathname.startsWith("/dashboard")) {
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role:roles(name)")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const roleName = (userData as any)?.role?.name || "";
    const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);

    if (isAdmin) {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  // 3. Redirecting authenticated users away from Login and Signup
  if (url.pathname === "/login" || url.pathname === "/signup") {
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role:roles(name)")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const roleName = (userData as any)?.role?.name || "";
      const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);

      if (isAdmin) {
        url.pathname = "/admin";
      } else {
        url.pathname = "/dashboard";
      }
      return NextResponse.redirect(url);
    }
  }

  // 4. Redirecting authenticated admin away from Admin Login
  if (url.pathname === "/admin/login") {
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role:roles(name)")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const roleName = (userData as any)?.role?.name || "";
      const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);

      if (isAdmin) {
        url.pathname = "/admin";
      } else {
        url.pathname = "/dashboard";
      }
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
  ],
};
