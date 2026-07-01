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
    <footer className="bg-[#060b18] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5 w-fit" id="footer-logo">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#e8c96d]">
                <span className="text-[#0a0f1e] font-black text-sm">3M</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-base">Car Rentals</span>
                <span className="text-[#c9a84c] text-[10px] font-medium tracking-[0.2em] uppercase">
                  Goa&apos;s Premium Fleet
                </span>
              </div>
            </Link>

            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Goa&apos;s most trusted luxury car rental service. From compact hatchbacks
              to chauffeur-driven Mercedes, we deliver excellence on every road.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 text-white/60 hover:text-[#c9a84c] text-sm transition-colors duration-200"
                id="footer-phone"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +91 98765 43210
              </a>
              <a
                href="mailto:hello@3mcarrentals.com"
                className="flex items-center gap-2 text-white/60 hover:text-[#c9a84c] text-sm transition-colors duration-200"
                id="footer-email"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                hello@3mcarrentals.com
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} 3M Car Rentals. All rights reserved. Panaji, Goa, India.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/30 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
