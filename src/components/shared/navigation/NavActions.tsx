"use client";

import Link from "next/link";
import { clsx } from "clsx";
import LoginButton from "./LoginButton";
import ReserveButton from "./ReserveButton";

interface NavActionsProps {
  isSignedIn: boolean;
  dashboardHref: string;
  onLogout: () => Promise<void>;
}

export default function NavActions({ isSignedIn, dashboardHref, onLogout }: NavActionsProps) {
  return (
    <div className="hidden md:flex items-center gap-6 lg:gap-8">
      {isSignedIn ? (
        <>
          {/* Dashboard Link (using matching ghost style as Login button for visual harmony) */}
          <Link
            href={dashboardHref}
            id="header-dashboard-link"
            className={clsx(
              "inline-flex items-center justify-center font-medium tracking-widest uppercase text-[11px] md:text-xs rounded-[20px] cursor-pointer outline-none select-none transition-all duration-300 ease-in-out border border-transparent",
              "bg-transparent text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]",
              "focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold/50",
              "min-h-[44px] px-5"
            )}
            style={{ fontFamily: "var(--font-body)" }}
          >
            Dashboard
          </Link>

          {/* Call Now Text Link */}
          <a
            href="tel:+919876543210"
            id="header-call-now-btn"
            className="text-white/50 hover:text-white transition-colors duration-300 font-semibold tracking-widest text-[11px] md:text-xs uppercase outline-none focus-visible:text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Call Now
          </a>

          {/* Log Out Button (Slate glass with hover states) */}
          <button
            onClick={onLogout}
            id="header-logout-btn"
            className={clsx(
              "btn-glass btn-glass-slate",
              "hover:border-red-500/30 hover:bg-red-950/20 hover:text-red-300 transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-red-400/50 outline-none",
              "min-h-[44px] px-5 text-[11px] md:text-xs font-semibold tracking-widest uppercase"
            )}
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          {/* Login Button (Ghost style) */}
          <LoginButton />

          {/* Call Now Text Link */}
          <a
            href="tel:+919876543210"
            id="header-call-now-btn"
            className="text-white/50 hover:text-white transition-colors duration-300 font-semibold tracking-widest text-[11px] md:text-xs uppercase outline-none focus-visible:text-white"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Call Now
          </a>

          {/* Reserve Button (Primary CTA) */}
          <ReserveButton />
        </>
      )}
    </div>
  );
}
