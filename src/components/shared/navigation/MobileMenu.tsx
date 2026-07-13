"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";

interface MobileMenuProps {
  isSignedIn: boolean;
  dashboardHref: string;
  onLogout: () => Promise<void>;
}

const NAV_LINKS = [
  { label: "Fleet", href: "/fleet" },
  { label: "Airport Transfers", href: "/airport" },
  { label: "Experiences", href: "/experiences" },
  { label: "About", href: "/about" },
];

export default function MobileMenu({ isSignedIn, dashboardHref, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger Toggle Button (44px target) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center w-11 h-11 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 z-50 select-none group"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
        id="mobile-menu-toggle"
      >
        <div className="w-6 flex flex-col gap-1.5 justify-center items-center">
          <span
            className={clsx(
              "block w-6 h-px bg-white/80 transition-all duration-300 origin-center",
              isOpen ? "rotate-45 translate-y-[7px]" : ""
            )}
          />
          <span
            className={clsx(
              "block w-6 h-px bg-white/80 transition-all duration-300",
              isOpen ? "opacity-0" : ""
            )}
          />
          <span
            className={clsx(
              "block w-6 h-px bg-white/80 transition-all duration-300 origin-center",
              isOpen ? "-rotate-45 -translate-y-[7px]" : ""
            )}
          />
        </div>
      </button>

      {/* Drawer Overlay (Glassmorphism design) */}
      <div
        id="mobile-menu"
        className={clsx(
          "absolute top-full left-0 right-0 bg-[#121210]/95 backdrop-blur-2xl border-t border-white/10 overflow-hidden transition-all duration-500 ease-in-out z-40 shadow-2xl",
          isOpen ? "max-h-[460px] opacity-100 py-6 border-b border-white/10" : "max-h-0 opacity-0 py-0"
        )}
      >
        <nav className="flex flex-col px-8 gap-5" aria-label="Main mobile navigation">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <button
                key={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={clsx(
                  "w-full text-left py-2.5 text-sm font-semibold tracking-widest uppercase border-b border-white/5 transition-colors duration-300 outline-none focus-visible:text-accent-gold",
                  isActive ? "text-accent-gold" : "text-white/60 hover:text-white"
                )}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {link.label}
              </button>
            );
          })}

          <div className="flex flex-col gap-4 pt-4">
            {isSignedIn ? (
              <>
                <button
                  onClick={() => { setIsOpen(false); router.push(dashboardHref); }}
                  className="btn-glass btn-glass-slate w-full min-h-[44px] text-xs font-semibold tracking-widest uppercase"
                  id="mobile-dashboard-link"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setIsOpen(false); onLogout(); }}
                  className="btn-glass btn-glass-danger w-full min-h-[44px] text-xs font-semibold tracking-widest uppercase"
                  id="mobile-logout-btn"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Login Button inside drawer */}
                  <button
                    onClick={() => { setIsOpen(false); router.push("/auth/login"); }}
                    className="btn-glass btn-glass-slate w-full min-h-[44px] text-xs font-semibold tracking-widest uppercase border border-white/10"
                    id="mobile-login-btn"
                  >
                    Login
                  </button>

                  {/* Reserve Button inside drawer */}
                  <button
                    onClick={() => { setIsOpen(false); router.push("/fleet"); }}
                    className="btn-glass btn-glass-blue animate-luxury-glow w-full min-h-[44px] text-xs font-semibold tracking-widest uppercase"
                    id="mobile-book-now-btn"
                  >
                    Reserve
                  </button>
                </div>
              </>
            )}

            {/* Mobile Call Now Action */}
            <a
              href="tel:+919876543210"
              className="text-white/50 hover:text-white transition-colors duration-300 font-semibold tracking-widest text-[11px] uppercase text-center mt-2 py-2 block min-h-[44px] flex items-center justify-center outline-none focus-visible:text-white"
              style={{ fontFamily: "var(--font-body)" }}
              id="mobile-call-now-btn"
            >
              Call Now
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
