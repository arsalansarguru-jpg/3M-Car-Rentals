import Link from "next/link";

const FOOTER_LINKS = {
  Fleet: [
    { label: "All Vehicles", href: "/fleet" },
    { label: "Hatchbacks", href: "/fleet?category=hatchback" },
    { label: "Sedans", href: "/fleet?category=sedan" },
    { label: "SUVs", href: "/fleet?category=suv" },
    { label: "Luxury Cars", href: "/fleet?category=luxury" },
  ],
  Services: [
    { label: "Airport Transfers", href: "/airport" },
    { label: "Corporate Rentals", href: "/corporate" },
    { label: "Wedding Cars", href: "/wedding" },
    { label: "Self Drive", href: "/self-drive" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#121210] border-t border-[#C9A84C]/8">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-20">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-20 mb-16">
          {/* Brand column */}
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-3 mb-8 w-fit" id="footer-logo">
              <span
                className="text-white"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                3M
              </span>
              <div className="flex flex-col leading-none">
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.625rem",
                    fontWeight: 400,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(201, 168, 76, 0.6)",
                  }}
                >
                  Car Rentals
                </span>
              </div>
            </Link>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                fontWeight: 300,
                lineHeight: 1.8,
                color: "rgba(212, 197, 176, 0.5)",
                letterSpacing: "0.01em",
              }}
            >
              Goa&apos;s most trusted luxury car rental service. From compact hatchbacks
              to chauffeur-driven Mercedes, we deliver excellence on every road.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 hover:text-[#C9A84C] transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  fontWeight: 400,
                  color: "rgba(212, 197, 176, 0.5)",
                  letterSpacing: "0.02em",
                }}
                id="footer-phone"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +91 98765 43210
              </a>
              <a
                href="mailto:hello@3mcarrentals.com"
                className="flex items-center gap-3 hover:text-[#C9A84C] transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  fontWeight: 400,
                  color: "rgba(212, 197, 176, 0.5)",
                  letterSpacing: "0.02em",
                }}
                id="footer-email"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                hello@3mcarrentals.com
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-20 sm:min-w-[400px]">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category} className="min-w-[120px]">
                <h4
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(201, 168, 76, 0.6)",
                    marginBottom: "1.5rem",
                  }}
                >
                  {category}
                </h4>
                <ul className="flex flex-col gap-3.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[rgba(212,197,176,0.45)] hover:text-white transition-colors duration-300"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.9375rem",
                          fontWeight: 400,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 400,
              color: "rgba(212, 197, 176, 0.25)",
              letterSpacing: "0.02em",
            }}
          >
            © {new Date().getFullYear()} 3M Car Rentals. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 400,
              color: "rgba(212, 197, 176, 0.25)",
              letterSpacing: "0.03em",
            }}
          >
            Est. 2024 · Panjim, Goa, India
          </p>
        </div>
      </div>
    </footer>
  );
}
