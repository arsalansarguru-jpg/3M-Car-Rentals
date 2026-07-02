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
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100vh", backgroundColor: "#060b18" }}
      >
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
        <div
          className="absolute inset-0 z-10 flex flex-col justify-center"
          style={{ paddingTop: "96px", paddingBottom: "64px" }}
        >
          <div className="w-full px-6 sm:px-10 lg:px-20">
            {/* Constrain text to left 55% of page on desktop */}
            <div style={{ maxWidth: "640px" }}>

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 mb-8"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
                <span className="text-[#c9a84c] font-semibold uppercase tracking-[0.15em]" style={{ fontSize: "11px" }}>
                  Goa&apos;s Premier Mobility Concierge
                </span>
              </div>

              {/* Headline — explicit white color to override any global styles */}
              <h1
                className="font-black tracking-tight mb-6"
                style={{
                  fontSize: "clamp(2.75rem, 5vw, 4.5rem)",
                  lineHeight: "1.05",
                  color: "#ffffff",
                }}
              >
                Drive Goa in{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #c9a84c, #e8c96d, #c9a84c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Pure Luxury
                </span>
              </h1>

              {/* Subheading — explicit color */}
              <p
                className="mb-10 leading-relaxed"
                style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.60)", maxWidth: "480px" }}
              >
                Handpicked premium vehicles delivered to your hotel, villa, or
                airport. Self-drive freedom or chauffeur comfort — your choice.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-14">
                <Link
                  href="/fleet"
                  id="hero-browse-fleet-btn"
                  className="inline-flex items-center gap-2 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1"
                  style={{
                    padding: "14px 32px",
                    background: "linear-gradient(135deg, #c9a84c, #e8c96d)",
                    color: "#0a0f1e",
                    fontSize: "1rem",
                    boxShadow: "0 8px 30px rgba(201,168,76,0.25)",
                  }}
                >
                  Browse Our Fleet
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="tel:+919876543210"
                  id="hero-call-btn"
                  className="inline-flex items-center gap-2 rounded-xl font-semibold border transition-all duration-300 hover:bg-white/5"
                  style={{
                    padding: "14px 28px",
                    borderColor: "rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "1rem",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  +91 98765 43210
                </a>
              </div>

              {/* Stats */}
              <div
                className="flex gap-10 pt-8"
                style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
              >
                {[
                  { v: "500+", l: "Happy Customers" },
                  { v: "30+",  l: "Premium Vehicles" },
                  { v: "5★",   l: "Average Rating" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="font-black" style={{ fontSize: "1.75rem", color: "#ffffff" }}>{s.v}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "4px" }}>{s.l}</p>
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
      <section style={{ backgroundColor: "#060b18", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🛫", title: "Airport Delivery",     desc: "GOX Mopa & GOI Dabolim" },
              { icon: "⚡", title: "Instant Booking",      desc: "Confirmed in 2 minutes" },
              { icon: "🛡️", title: "Fully Insured",       desc: "Zero liability for you" },
              { icon: "📞", title: "24/7 Support",         desc: "Always reachable" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center shrink-0 rounded-xl"
                  style={{ width: "44px", height: "44px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", fontSize: "20px" }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#ffffff" }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED FLEET
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#0a0f1e", padding: "96px 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] mb-2" style={{ fontSize: "11px", color: "#c9a84c" }}>
                Handpicked for You
              </p>
              <h2 className="font-black" style={{ color: "#ffffff", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
                Featured Vehicles
              </h2>
              <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "300px" }}>
                Our most popular picks — available today, delivered to you.
              </p>
            </div>
            <Link
              href="/fleet"
              id="homepage-view-all-link"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl text-sm font-medium border transition-all duration-200 hover:bg-white/5"
              style={{ padding: "10px 20px", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
            >
              View all {allVehicles.length} vehicles
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredVehicles.length === 0 ? (
            <p className="text-center py-16" style={{ color: "rgba(255,255,255,0.3)" }}>Fleet data loading — check back shortly.</p>
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
      <section style={{ backgroundColor: "#060b18", padding: "96px 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">

          <div className="text-center mb-16">
            <p className="font-semibold uppercase tracking-[0.2em] mb-3" style={{ fontSize: "11px", color: "#c9a84c" }}>The 3M Difference</p>
            <h2 className="font-black mb-4" style={{ color: "#ffffff", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>Why Travellers Choose Us</h2>
            <p className="text-sm leading-relaxed mx-auto" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "380px" }}>
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
                className="group relative rounded-2xl transition-all duration-300 hover:bg-white/5 hover:border-[#c9a84c]/25"
                style={{ padding: "32px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="absolute top-6 right-6 font-black select-none" style={{ fontSize: "4rem", color: "rgba(255,255,255,0.04)", lineHeight: 1 }}>{item.n}</div>
                <div className="text-3xl mb-5">{item.icon}</div>
                <h3 className="font-bold mb-3" style={{ fontSize: "1.125rem", color: "#ffffff" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#0a0f1e", padding: "96px 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10">

          <div className="text-center mb-12">
            <p className="font-semibold uppercase tracking-[0.2em] mb-3" style={{ fontSize: "11px", color: "#c9a84c" }}>Real Reviews</p>
            <h2 className="font-black" style={{ color: "#ffffff", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>What Our Guests Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya Menon",     from: "Mumbai",    text: "The BMW 3 Series was immaculate. Delivered to our hotel at 6am without any fuss. Will book again every time we're in Goa.",     rating: 5, vehicle: "BMW 3 Series" },
              { name: "Rahul Sharma",    from: "Bangalore", text: "Booked the Creta for 5 days — brilliant condition, GPS included, full tank. Team was always reachable. Highly recommend!",     rating: 5, vehicle: "Hyundai Creta" },
              { name: "Sarah Williams",  from: "Dubai",     text: "Flying in for a wedding, 3M had the GLE ready at Mopa airport. Seamless experience from booking to drop-off.",                  rating: 5, vehicle: "Mercedes GLE" },
            ].map((r) => (
              <div
                key={r.name}
                className="flex flex-col gap-4 rounded-2xl"
                style={{ padding: "28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" style={{ color: "#c9a84c" }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#ffffff" }}>{r.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>{r.from}</p>
                  </div>
                  <span
                    className="text-xs font-medium rounded-full px-3 py-1"
                    style={{ color: "#c9a84c", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
                  >
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
      <section className="relative overflow-hidden" style={{ backgroundColor: "#060b18", padding: "96px 0" }}>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full pointer-events-none" style={{ background: "rgba(201,168,76,0.08)", filter: "blur(80px)" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="font-semibold uppercase tracking-[0.2em] mb-4" style={{ fontSize: "11px", color: "#c9a84c" }}>Start Your Journey</p>
          <h2 className="font-black mb-5" style={{ color: "#ffffff", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: "1.1" }}>
            Ready to explore Goa in style?
          </h2>
          <p className="mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.50)", fontSize: "1.125rem" }}>
            Browse our curated fleet and lock in your vehicle in under 2 minutes. No hidden fees, no surprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/fleet"
              id="bottom-cta-btn"
              className="inline-flex items-center gap-2 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1"
              style={{ padding: "16px 36px", background: "linear-gradient(135deg, #c9a84c, #e8c96d)", color: "#0a0f1e", fontSize: "1rem", boxShadow: "0 8px 30px rgba(201,168,76,0.25)" }}
            >
              Browse the Full Fleet
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/auth/register"
              id="bottom-register-btn"
              className="inline-flex items-center gap-2 rounded-xl font-semibold border transition-all duration-300 hover:bg-white/5"
              style={{ padding: "16px 36px", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", fontSize: "1rem" }}
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
