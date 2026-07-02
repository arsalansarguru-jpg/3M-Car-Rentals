import Link from "next/link";
import Image from "next/image";
import { getAvailableVehicles } from "@/services/fleet.service";
import VehicleCard from "@/components/fleet/VehicleCard";

export const metadata = {
  title: "3M Car Rentals — Goa's Premium Self-Drive Fleet",
  description:
    "Luxury and economy car rentals in Goa. Self-drive or chauffeur-driven. Airport delivery at GOX & GOI. Book online instantly.",
};

export default async function HomePage() {
  const allVehicles = await getAvailableVehicles();
  const featuredVehicles = allVehicles.slice(0, 3);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          HERO — bg image fills section, content sits in absolute overlay
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden bg-[#060b18]">
        {/* Background photo */}
        <Image
          src="/hero-bg.jpg"
          alt="Luxury car on Goa coastal road at golden hour"
          fill
          priority
          quality={90}
          className="object-cover object-center"
        />

        {/* Left-to-right dark fade so text on the left is always readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b18] via-[#060b18]/80 to-[#060b18]/10" />
        {/* Top and bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060b18]/60 via-transparent to-[#060b18]" />

        {/* Content — absolutely fills section, uses flex to center vertically */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center pt-24 pb-16">
          <div className="w-full px-6 sm:px-10 lg:px-20">
            {/* Constrain text to left 55% of page on desktop */}
            <div className="max-w-[640px]">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 backdrop-blur-sm mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
                <span className="text-[#c9a84c] font-semibold uppercase tracking-[0.15em] text-[11px]">
                  Goa&apos;s Premier Mobility Concierge
                </span>
              </div>

              {/* Headline — explicit white color to override any global styles */}
              <h1 className="text-white font-black tracking-tight mb-6 text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.05]">
                Drive Goa in{" "}
                <span className="bg-gradient-to-r from-[#c9a84c] via-[#e8c96d] to-[#c9a84c] bg-clip-text text-transparent">
                  Pure Luxury
                </span>
              </h1>

              {/* Subheading — explicit color */}
              <p className="mb-10 text-white/60 text-lg leading-relaxed max-w-[480px]">
                Handpicked premium vehicles delivered to your hotel, villa, or
                airport. Self-drive freedom or chauffeur comfort — your choice.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-14">
                <Link
                  href="/fleet"
                  id="hero-browse-fleet-btn"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-base shadow-lg shadow-[#c9a84c]/20 hover:-translate-y-1 transition-all duration-300"
                >
                  Browse Our Fleet
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="tel:+919876543210"
                  id="hero-call-btn"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-white/25 text-white/85 text-base backdrop-blur-sm hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  +91 98765 43210
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-white/10">
                {[
                  { v: "500+", l: "Happy Customers" },
                  { v: "30+",  l: "Premium Vehicles" },
                  { v: "5★",   l: "Average Rating" },
                ].map((s) => (
                  <div key={s.l} className="min-w-[120px]">
                    <p className="text-white font-black text-3xl">{s.v}</p>
                    <p className="text-white/40 text-[11px] font-semibold uppercase tracking-[0.15em] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          USP STRIP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#060b18] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🛫", title: "Airport Delivery",     desc: "GOX Mopa & GOI Dabolim" },
              { icon: "⚡", title: "Instant Booking",      desc: "Confirmed in 2 minutes" },
              { icon: "🛡️", title: "Fully Insured",       desc: "Zero liability for you" },
              { icon: "📞", title: "24/7 Support",         desc: "Always reachable" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-xl">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED FLEET
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0f1e] py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="flex-1 max-w-md">
              <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-2">
                Handpicked for You
              </p>
              <h2 className="text-white font-black text-[clamp(1.75rem,3vw,2.5rem)]">
                Featured Vehicles
              </h2>
              <p className="text-white/40 text-sm mt-2">
                Our most popular picks — available today, delivered to you.
              </p>
            </div>
            <Link
              href="/fleet"
              id="homepage-view-all-link"
              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              View all {allVehicles.length} vehicles
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredVehicles.length === 0 ? (
            <p className="text-white/30 text-center py-16">Fleet data loading — check back shortly.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY US
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#060b18] py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">

          <div className="text-center mb-16">
            <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-3">The 3M Difference</p>
            <h2 className="text-white font-black text-[clamp(1.75rem,3vw,2.5rem)] mb-4">Why Travellers Choose Us</h2>
            <p className="text-white/40 text-sm leading-relaxed max-w-[380px] mx-auto">
              We don&apos;t just rent cars. We deliver experiences backed by local expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: "🏎️", title: "Showroom-Condition Fleet", desc: "Every vehicle is professionally detailed, mechanically inspected, and verified before each rental." },
              { n: "02", icon: "✈️", title: "Zero-Wait Airport Pickup", desc: "Your car is at the terminal when your flight lands. We track your flight live." },
              { n: "03", icon: "🤝", title: "White-Glove Concierge", desc: "A personal coordinator handles hotel delivery, road assistance, and any request — 24/7." },
            ].map((item) => (
              <div
                key={item.n}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-[#c9a84c]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="absolute top-6 right-6 text-white/[0.04] font-black text-6xl select-none leading-none">{item.n}</div>
                <div className="text-3xl mb-5">{item.icon}</div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0f1e] py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">

          <div className="text-center mb-12">
            <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-3">Real Reviews</p>
            <h2 className="text-white font-black text-[clamp(1.75rem,3vw,2.5rem)]">What Our Guests Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya Menon",     from: "Mumbai",    text: "The BMW 3 Series was immaculate. Delivered to our hotel at 6am without any fuss. Will book again every time we're in Goa.",     rating: 5, vehicle: "BMW 3 Series" },
              { name: "Rahul Sharma",    from: "Bangalore", text: "Booked the Creta for 5 days — brilliant condition, GPS included, full tank. Team was always reachable. Highly recommend!",     rating: 5, vehicle: "Hyundai Creta" },
              { name: "Sarah Williams",  from: "Dubai",     text: "Flying in for a wedding, 3M had the GLE ready at Mopa airport. Seamless experience from booking to drop-off.",                  rating: 5, vehicle: "Mercedes GLE" },
            ].map((r) => (
              <div
                key={r.name}
                className="flex flex-col gap-4 p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-[#c9a84c]/20 hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="flex gap-1 text-[#c9a84c]">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <p className="text-white font-semibold text-sm">{r.name}</p>
                    <p className="text-white/30 text-xs">{r.from}</p>
                  </div>
                  <span className="text-[#c9a84c] text-xs font-medium rounded-full px-3 py-1 bg-[#c9a84c]/10 border border-[#c9a84c]/20">
                    {r.vehicle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA BAND
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#060b18] py-24">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full bg-[#c9a84c]/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-4">Start Your Journey</p>
          <h2 className="text-white font-black text-[clamp(2rem,4vw,3rem)] leading-[1.1] mb-5">
            Ready to explore Goa in style?
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Browse our curated fleet and lock in your vehicle in under 2 minutes. No hidden fees, no surprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/fleet"
              id="bottom-cta-btn"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-bold bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-base shadow-lg shadow-[#c9a84c]/20 hover:-translate-y-1 transition-all duration-300"
            >
              Browse the Full Fleet
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/auth/register"
              id="bottom-register-btn"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-semibold border border-white/20 text-white/80 text-base hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
