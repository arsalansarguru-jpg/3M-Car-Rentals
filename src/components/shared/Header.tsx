"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { label: "Fleet", href: "/fleet" },
  { label: "Airport Transfers", href: "/airport" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Auth state ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function syncSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsSignedIn(true);
        const { data: userRow } = await supabase
          .from("users")
          .select("role:roles(name)")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();
        const roleName = (userRow?.role as any)?.name ?? "customer";
        const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);
        setDashboardHref(isAdmin ? "/dashboard/admin" : "/dashboard/client");
      } else {
        setIsSignedIn(false);
      }
    }

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsSignedIn(true);
        syncSession();
      } else {
        setIsSignedIn(false);
        setDashboardHref("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0f1e]/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" id="site-logo">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#e8c96d] shadow-md group-hover:shadow-[#c9a84c]/40 transition-shadow duration-300">
              <span className="text-[#0a0f1e] font-black text-sm tracking-tight">3M</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-base tracking-wide">
                Car Rentals
              </span>
              <span className="text-[#c9a84c] text-[10px] font-medium tracking-[0.2em] uppercase">
                Goa&apos;s Premium Fleet
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 relative group ${
                    isActive ? "text-[#c9a84c]" : "text-white/80 hover:text-white"
                  }`}
                  id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-[#c9a84c] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA — auth-aware */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
                  id="header-dashboard-link"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white/80 text-sm font-semibold rounded-lg hover:bg-white/5 hover:border-white/40 transition-all duration-200 cursor-pointer"
                  id="header-logout-btn"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
                  id="header-login-link"
                >
                  Sign In
                </Link>
                <Link
                  href="/fleet"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-[#c9a84c]/30 hover:-translate-y-0.5 transition-all duration-200"
                  id="header-book-now-btn"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 group"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle mobile menu"
            id="mobile-menu-toggle"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`md:hidden bg-[#0a0f1e]/98 backdrop-blur-md border-t border-white/10 overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        id="mobile-menu"
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-base font-medium py-1.5 border-b border-white/5 transition-colors duration-200 ${
                  isActive ? "text-[#c9a84c]" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex gap-3 pt-2">
            {isSignedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm font-bold rounded-lg"
                  id="mobile-dashboard-link"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex-1 text-center py-2.5 border border-white/20 text-white text-sm font-medium rounded-lg hover:border-white/40 transition-colors duration-200 cursor-pointer"
                  id="mobile-logout-btn"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 border border-white/20 text-white text-sm font-medium rounded-lg hover:border-white/40 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/fleet"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm font-bold rounded-lg"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
