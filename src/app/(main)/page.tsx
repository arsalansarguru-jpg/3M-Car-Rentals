import Link from "next/link";
import { getAvailableVehicles } from "@/services/fleet.service";
import VehicleCard from "@/components/fleet/VehicleCard";
import Hero from "@/components/home/Hero";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "3M Car Rentals — Luxury Self-Drive Experiences in Goa",
  description:
    "Curated luxury self-drive experiences in Goa. Premium vehicles delivered to your door. Airport pickup at GOX & GOI.",
};

export default async function HomePage() {
  const allVehicles = await getAvailableVehicles();
  const featuredVehicles = allVehicles.slice(0, 3);

  return (
    <>
      <Hero />

      {/* ═══════════════════════════════════════════════════════════════
          USP STRIP — Elegant service pillars
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#121210] border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                title: "Airport Delivery",
                desc: "GOX Mopa & GOI Dabolim",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                ),
              },
              {
                title: "Instant Booking",
                desc: "Confirmed in 2 minutes",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: "Fully Insured",
                desc: "Zero liability for you",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: "24/7 Concierge",
                desc: "Always reachable",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5 text-[#C9A84C]">
                  {item.icon}
                </div>
                <div>
                  <p
                    className="font-medium text-white tracking-wider"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.125rem",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="font-light text-[#E8DCC8]/50 mt-1"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED FLEET — Handpicked collection
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1A1916] py-36">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div className="flex-1 max-w-lg">
              <div className="flex items-center gap-3 mb-5">
                <span className="block w-6 h-px bg-[#C9A84C]/45" />
                <p
                  className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Handpicked for You
                </p>
              </div>
              <h2
                className="text-white leading-tight"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                }}
              >
                Featured Vehicles
              </h2>
              <p
                className="text-[#E8DCC8]/50 mt-3 font-light"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "1.125rem",
                }}
              >
                Our most popular picks — available today, delivered to you.
              </p>
            </div>
            <Link
              href="/fleet"
              id="homepage-view-all-link"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:border-[#C9A84C]/45 transition-colors duration-300 rounded-[20px] bg-white/[0.03]"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.1rem",
                textTransform: "uppercase",
              }}
            >
              View all {allVehicles.length} vehicles
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredVehicles.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                color: "rgba(212, 197, 176, 0.3)",
              }}
              className="text-center py-20"
            >
              Fleet data loading — check back shortly.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY US — The 3M Difference
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#121210] py-36">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">

          <div className="text-center mb-24">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="block w-10 h-px bg-[#C9A84C]/30" />
              <p
                className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                The 3M Difference
              </p>
              <span className="block w-10 h-px bg-[#C9A84C]/30" />
            </div>
            <h2
              className="text-white leading-tight mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
              }}
            >
              Why Travellers Choose Us
            </h2>
            <p
              className="text-[#E8DCC8]/50 max-w-md mx-auto font-light"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.125rem",
              }}
            >
              We don&apos;t just rent cars. We deliver experiences backed by local expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Showroom-Condition Fleet", desc: "Every vehicle is professionally detailed, mechanically inspected, and verified before each rental." },
              { n: "02", title: "Zero-Wait Airport Pickup", desc: "Your car is at the terminal when your flight lands. We track your flight live." },
              { n: "03", title: "White-Glove Concierge", desc: "A personal coordinator handles hotel delivery, road assistance, and any request — 24/7." },
            ].map((item) => (
              <div
                key={item.n}
                className="group relative p-10 bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] hover:border-[#C9A84C]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                <div
                  className="absolute top-8 right-8 text-white/[0.02] font-light select-none leading-none pointer-events-none"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "4.5rem" }}
                >
                  {item.n}
                </div>
                <p
                  className="text-[#C9A84C]/80 text-[10px] font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.n}
                </p>
                <h3
                  className="text-white mb-4"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.625rem",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[#E8DCC8]/50 font-light"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                    lineHeight: 1.8,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS — Guest stories
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1A1916] py-36">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">

          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="block w-10 h-px bg-[#C9A84C]/30" />
              <p
                className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Guest Stories
              </p>
              <span className="block w-10 h-px bg-[#C9A84C]/30" />
            </div>
            <h2
              className="text-white leading-tight"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
              }}
            >
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Priya Menon",     from: "Mumbai",    text: "The BMW 3 Series was immaculate. Delivered to our hotel at 6am without any fuss. Will book again every time we're in Goa.",     rating: 5, vehicle: "BMW 3 Series" },
              { name: "Rahul Sharma",    from: "Bangalore", text: "Booked the Creta for 5 days — brilliant condition, GPS included, full tank. Team was always reachable. Highly recommend!",     rating: 5, vehicle: "Hyundai Creta" },
              { name: "Sarah Williams",  from: "Dubai",     text: "Flying in for a wedding, 3M had the GLE ready at Mopa airport. Seamless experience from booking to drop-off.",                  rating: 5, vehicle: "Mercedes GLE" },
            ].map((r) => (
              <div
                key={r.name}
                className="flex flex-col gap-6 p-10 bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] hover:border-[#C9A84C]/30 hover:-translate-y-1.5 transition-all duration-300 h-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]"
              >
                <div className="flex gap-1.5 text-[#C9A84C]">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p
                  className="font-light italic text-[#E8DCC8]/60 flex-1 leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1.0625rem",
                  }}
                >
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                  <div>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 400, color: "#ffffff" }}>{r.name}</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 400, color: "rgba(232, 220, 200, 0.4)", marginTop: "0.125rem" }}>{r.from}</p>
                  </div>
                  <span
                    className="px-4 py-1.5 border border-white/10 bg-white/[0.03] text-[#C9A84C]/80 rounded-[20px]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                    }}
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
          FINAL CTA — Invitation
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#121210] py-36">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-[#C9A84C]/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-10 h-px bg-[#C9A84C]/30" />
            <p
              className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Start Your Journey
            </p>
            <span className="block w-10 h-px bg-[#C9A84C]/30" />
          </div>
          <h2
            className="text-white leading-tight mb-6"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
              fontWeight: 300,
            }}
          >
            Ready to explore Goa in style?
          </h2>
          <p
            className="text-[#E8DCC8]/50 font-light mb-12"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.125rem",
              lineHeight: 1.8,
            }}
          >
            Browse our curated fleet and reserve your vehicle in under 2 minutes. No hidden fees, no surprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/fleet"
              id="bottom-cta-btn"
              className="btn-glass btn-glass-blue h-12 px-10 text-xs font-semibold tracking-[0.14em] uppercase inline-flex items-center justify-center gap-2 rounded-[20px] transition-all active:scale-[0.98]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Browse the Full Fleet
              <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/auth/register"
              id="bottom-register-btn"
              className="btn-glass bg-transparent border-white/15 text-white/80 hover:border-white/40 hover:bg-white/5 h-12 px-10 text-xs font-semibold tracking-[0.14em] uppercase inline-flex items-center justify-center gap-2 rounded-[20px] transition-all active:scale-[0.98]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
