"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  role: {
    name: string;
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [sessionLoading, setSessionLoading] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthorized, setIsAuthorized] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    async function initializeSession() {
      try {
        // Explicitly get the session (safely waits for localStorage if needed)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
        }

        if (!session) {
          if (active) {
            setIsAuthorized(false);
            setSessionLoading(false);
          }
          return;
        }

        // Session exists — fetch user profile
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, email, role:roles(name)")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (active) {
          if (userData) {
            setProfile(userData as unknown as Profile);
          } else {
            setProfile({
              first_name: session.user.email?.split("@")[0] || "User",
              last_name: "",
              email: session.user.email || "",
              role: { name: "customer" },
            });
          }
          setIsAuthorized(true);
          setSessionLoading(false);
        }
      } catch (err) {
        console.error("Dashboard auth check failed:", err);
        if (active) {
          setIsAuthorized(false);
          setSessionLoading(false);
        }
      }
    }

    initializeSession();

    // Listen for subsequent auth state changes (e.g., logout in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;
        
        if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
          setIsAuthorized(false);
          setSessionLoading(false);
        } else if (event === "SIGNED_IN" && session) {
          // If a sign-in happens while this layout is mounted, re-initialize
          initializeSession();
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []); // Run once on mount

  React.useEffect(() => {
    if (sessionLoading) return;
    if (!isAuthorized) return;

    const currentRole = profile?.role?.name || "customer";
    const userIsAdmin = ["admin", "super_admin", "manager", "staff"].includes(currentRole);

    if (pathname.startsWith("/dashboard/admin") && !userIsAdmin) {
      router.replace("/dashboard/client");
    } else if (pathname.startsWith("/dashboard/client") && userIsAdmin) {
      router.replace("/dashboard/admin");
    }
  }, [pathname, profile, sessionLoading, isAuthorized, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const role = profile?.role?.name || "customer";
  const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(role);
  const fullName = `${profile?.first_name} ${profile?.last_name}`.trim();

  const isCorrectPage =
    (pathname.startsWith("/dashboard/admin") && isAdmin) ||
    (pathname.startsWith("/dashboard/client") && !isAdmin) ||
    (!pathname.startsWith("/dashboard/admin") && !pathname.startsWith("/dashboard/client"));

  if (sessionLoading || !isAuthorized || !isCorrectPage) {
    if (!isAuthorized) {
      return (
        <div className="min-h-screen bg-[#060b18] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Access Denied</h2>
            <p className="text-white/50 text-sm mb-8">
              You must be signed in to access the dashboard. If you just signed in, your session may have expired.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold bg-[#c9a84c] text-[#0a0f1e] hover:bg-[#e8c96d] transition-colors"
              >
                Sign In Now
              </Link>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#c9a84c]/20 border-t-[#c9a84c] rounded-full animate-spin" />
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">
            {!isCorrectPage && isAuthorized ? "Redirecting..." : "Checking Credentials..."}
          </p>
        </div>
      </div>
    );
  }

  const navigationItems = isAdmin
    ? [
        { name: "Overview", href: "/dashboard/admin", icon: "📊" },
        { name: "Verify Licenses", href: "/dashboard/admin#licensing", icon: "🪪" },
        { name: "Browse Fleet", href: "/fleet", icon: "🏎️" },
        { name: "Back to Site", href: "/", icon: "🏠" },
      ]
    : [
        { name: "My Bookings", href: "/dashboard/client", icon: "📅" },
        { name: "Rent a Car", href: "/fleet", icon: "🏎️" },
        { name: "Support Chat", href: "/contact", icon: "💬" },
        { name: "Back to Site", href: "/", icon: "🏠" },
      ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col lg:flex-row text-gray-200">
      {/* ── Mobile Header ── */}
      <header className="lg:hidden h-16 border-b border-white/5 bg-[#060b18]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#e8c96d] flex items-center justify-center">
            <span className="text-[#0a0f1e] font-black text-xs">3M</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wider uppercase font-display">Car Rentals</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </header>

      {/* ── Sidebar Component (Desktop and Mobile drawer) ── */}
      <aside
        className={`fixed inset-y-0 left-0 lg:sticky top-0 h-screen w-72 bg-[#060b18] border-r border-white/5 z-50 flex flex-col justify-between p-6 transition-transform duration-300 transform lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96d] flex items-center justify-center shadow-lg shadow-[#c9a84c]/10">
                <span className="text-[#0a0f1e] font-black text-sm">3M</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-wider leading-none uppercase font-display">Car Rentals</p>
                <p className="text-[#c9a84c] text-[9px] tracking-[0.15em] uppercase font-bold mt-1">Goa Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white/40 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all duration-200 uppercase ${
                    isActive
                      ? "bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]"
                      : "text-white/60 border border-transparent hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer section */}
        <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-lg font-bold text-[#c9a84c] select-none">
              {profile?.first_name ? profile.first_name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate leading-tight uppercase font-display">{fullName}</p>
              <p className="text-white/40 text-xs truncate leading-normal mt-0.5">{profile?.email}</p>
              <span
                className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-2 ${
                  isAdmin ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20"
                }`}
              >
                {isAdmin ? "Admin staff" : "Customer"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold tracking-wider text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-colors uppercase cursor-pointer"
          >
            🚪 Log Out Session
          </button>
        </div>
      </aside>

      {/* ── Overlay for mobile menu ── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 min-w-0 overflow-y-auto px-6 py-8 lg:px-12 lg:py-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
