"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_LINKS = [
  { label: "Fleet", href: "/fleet" },
  { label: "Airport Transfers", href: "/airport" },
  { label: "Experiences", href: "/experiences" },
  { label: "About", href: "/about" },
];

export default function DesktopMenu() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6 lg:gap-10" aria-label="Main desktop navigation">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={clsx(
              "relative py-2 text-[11px] lg:text-xs font-semibold tracking-widest uppercase transition-colors duration-300 select-none outline-none group",
              isActive ? "text-accent-gold" : "text-white/60 hover:text-white",
              "focus-visible:text-white focus-visible:ring-1 focus-visible:ring-accent-gold/40 rounded px-1.5"
            )}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {link.label}
            {/* Smooth sliding underline animation */}
            <span
              className={clsx(
                "absolute bottom-0 left-0 h-[2px] bg-accent-gold transition-all duration-300 ease-out",
                isActive ? "w-full" : "w-0 group-hover:w-full"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
