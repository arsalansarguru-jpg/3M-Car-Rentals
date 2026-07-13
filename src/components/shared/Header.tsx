"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Fleet", href: "/fleet" },
  { label: "Airport Transfers", href: "/airport" },
  { label: "Experiences", href: "/experiences" },
  { label: "About", href: "/about" },
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
        const roleName = (userRow?.role as unknown as { name: string } | null)?.name ?? "customer";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/[0.07] backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">

          {/* ── Logo: Minimal serif wordmark ── */}
          <Link href="/" className="flex items-center gap-3 group" id="site-logo">
            <span
              className="text-white transition-colors duration-300 group-hover:text-[#C9A84C]"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              3M
            </span>
            <span
              className="hidden sm:block"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.625rem",
                fontWeight: 400,
                letterSpacing: "0.22em",
                textTransform: "uppercase" as const,
                color: "rgba(232, 220, 200, 0.5)",
              }}
            >
              Car Rentals
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-all duration-300 relative group py-2 ${isActive ? "text-[#C9A84C]" : "text-white/60 hover:text-white"}`}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                  }}
                  id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-[#C9A84C] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="tel:+919876543210"
              className="text-white/50 hover:text-white transition-colors duration-300 font-medium tracking-[0.1em] text-xs uppercase"
              style={{ fontFamily: "var(--font-body)" }}
              id="header-call-now-btn"
            >
              Call Now
            </a>
            {isSignedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-white/50 hover:text-[#C9A84C] transition-colors duration-300 text-xs font-medium uppercase tracking-[0.1em]"
                  style={{ fontFamily: "var(--font-body)" }}
                  id="header-dashboard-link"
                >
                  Dashboard
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="rounded-[20px]"
                  id="header-logout-btn"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => router.push("/fleet")}
                variant="primary"
                size="sm"
                className="rounded-[20px]"
                id="header-book-now-btn"
              >
                Reserve
              </Button>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 group"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle mobile menu"
            id="mobile-menu-toggle"
          >
            <span className={`block w-6 h-px bg-white/70 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-6 h-px bg-white/70 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-white/70 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu drawer (Glassmorphism layout) ── */}
      <div
        className={`md:hidden bg-white/[0.08] backdrop-blur-2xl border-t border-white/10 overflow-hidden transition-all duration-400 ${
          mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
        id="mobile-menu"
      >
        <nav className="flex flex-col px-8 py-6 gap-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`py-2 border-b border-white/5 transition-colors duration-300 ${
                  isActive ? "text-[#C9A84C]" : "text-white/60 hover:text-white"
                }`}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex gap-4 pt-4">
            {isSignedIn ? (
              <>
                <Button
                  onClick={() => { setMobileOpen(false); router.push(dashboardHref); }}
                  variant="primary"
                  className="flex-1 rounded-[20px]"
                  id="mobile-dashboard-link"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  variant="outline"
                  className="flex-1 rounded-[20px]"
                  id="mobile-logout-btn"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => { setMobileOpen(false); router.push("/auth/login"); }}
                  variant="outline"
                  className="flex-1 rounded-[20px]"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => { setMobileOpen(false); router.push("/fleet"); }}
                  variant="primary"
                  className="flex-1 rounded-[20px]"
                >
                  Reserve
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
