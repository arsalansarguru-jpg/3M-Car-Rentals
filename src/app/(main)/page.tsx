import Link from "next/link";
import { getAvailableVehicles } from "@/services/fleet.service";
import VehicleCard from "@/components/fleet/VehicleCard";

export const metadata = {
  title: "3M Car Rentals — Goa's Premium Self-Drive Fleet",
  description:
    "Luxury and economy car rentals in Goa. Self-drive or chauffeur-driven. Airport delivery at GOX (Mopa) and GOI (Dabolim). Book online instantly.",
};

export default async function HomePage() {
  // Pre-fetch 3 featured vehicles server-side for the homepage preview
  const allVehicles = await getAvailableVehicles();
  const featuredVehicles = allVehicles.slice(0, 3);

  return (
    <>
      {/* ============================================================
          HERO SECTION — Full viewport, dark gradient, gold accents
      ============================================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-[#0a0f1e]">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1629] to-[#0a0f1e]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#c9a84c]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1a3a6b]/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1a3a6b]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-8 pt-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
            <span className="text-[#c9a84c] text-xs font-semibold tracking-[0.15em] uppercase">
              Goa&apos;s Premier Mobility Concierge
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            Drive Goa in{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] via-[#e8c96d] to-[#c9a84c]">
                Pure Luxury
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl text-lg sm:text-xl text-white/60 leading-relaxed font-light">
            Handpicked premium vehicles delivered to your hotel, villa, or airport.
            Self-drive freedom or chauffeur-driven comfort — your choice.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/fleet"
              id="hero-browse-fleet-btn"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] font-bold text-base rounded-xl hover:shadow-2xl hover:shadow-[#c9a84c]/30 hover:-translate-y-1 transition-all duration-300"
            >
              Browse Our Fleet
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="tel:+919876543210"
              id="hero-call-btn"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold text-base rounded-xl hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call to Book
            </a>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-6 border-t border-white/10 w-full max-w-lg">
            {[
              { value: "500+", label: "Happy Customers" },
              { value: "30+", label: "Premium Vehicles" },
              { value: "5★", label: "Avg. Rating" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-white/40 text-xs uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ============================================================
          USP STRIP
      ============================================================ */}
      <section className="bg-[#060b18] border-y border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🛫", title: "Airport Delivery", desc: "GOX & GOI airports" },
              { icon: "🔑", title: "Instant Booking", desc: "Confirmed in minutes" },
              { icon: "🛡️", title: "Fully Insured", desc: "Zero liability for you" },
              { icon: "📱", title: "24/7 Support", desc: "Always reachable" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED FLEET PREVIEW
      ============================================================ */}
      <section className="bg-[#0a0f1e] py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                Handpicked for You
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Featured Vehicles
              </h2>
            </div>
            <Link
              href="/fleet"
              id="homepage-view-all-link"
              className="text-sm font-semibold text-[#c9a84c] hover:text-white transition-colors duration-200 flex items-center gap-1 shrink-0"
            >
              View Full Fleet
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredVehicles.length === 0 ? (
            <p className="text-white/40 text-center py-16">Fleet details coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          WHY US SECTION
      ============================================================ */}
      <section className="bg-[#060b18] py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              The 3M Difference
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Why Travellers Choose Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Showroom-Condition Fleet",
                desc: "Every vehicle is inspected, detailed, and verified before every rental. No surprises, no compromises.",
              },
              {
                number: "02",
                title: "Zero-Wait Airport Pickup",
                desc: "Your car is at the terminal when your flight lands. We track your flight in real time.",
              },
              {
                number: "03",
                title: "White-Glove Concierge",
                desc: "A dedicated coordinator handles everything from hotel delivery to road assistance, 24/7.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="relative group p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#c9a84c]/30 transition-all duration-300"
              >
                <span className="absolute top-6 right-6 text-5xl font-black text-white/5 group-hover:text-[#c9a84c]/10 transition-colors duration-300">
                  {item.number}
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/10 flex items-center justify-center mb-5">
                  <span className="text-[#c9a84c] font-bold text-sm">{item.number}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
      ============================================================ */}
      <section className="bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0a0f1e] mb-4">
            Ready to explore Goa in style?
          </h2>
          <p className="text-[#0a0f1e]/70 mb-8 text-lg">
            Browse our fleet and secure your vehicle online in under 2 minutes.
          </p>
          <Link
            href="/fleet"
            id="bottom-cta-btn"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a0f1e] text-white font-bold text-base rounded-xl hover:bg-[#060b18] hover:-translate-y-1 transition-all duration-300 shadow-xl"
          >
            Browse the Full Fleet
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
