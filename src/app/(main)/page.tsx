import Link from "next/link";
import Image from "next/image";
import { getAvailableVehicles } from "@/services/fleet.service";
import VehicleCard from "@/components/fleet/VehicleCard";

export const metadata = {
  title: "3M Car Rentals — Goa's Premium Self-Drive Fleet",
  description:
    "Luxury and economy car rentals in Goa. Self-drive or chauffeur-driven. Airport delivery at GOX (Mopa) and GOI (Dabolim). Book online instantly.",
};

const USP_ITEMS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: "Inspection-Verified",
    desc: "Every car checked before every rental",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Instant Confirmation",
    desc: "Booking confirmed in under 2 minutes",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: "Airport Delivery",
    desc: "GOX Mopa & GOI Dabolim covered",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "24/7 Support",
    desc: "Dedicated coordinator always reachable",
  },
];

export default async function HomePage() {
  const allVehicles = await getAvailableVehicles();
  const featuredVehicles = allVehicles.slice(0, 3);

  return (
    <>
      {/* ================================================================
          HERO — Full viewport with real car image
      ================================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/hero-bg.jpg"
          alt="Luxury car on Goa coastal road"
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b18]/95 via-[#060b18]/70 to-[#060b18]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b18] via-transparent to-[#060b18]/40" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              <span className="text-[#c9a84c] text-xs font-semibold tracking-[0.15em] uppercase">
                Goa&apos;s Premier Mobility Concierge
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6">
              Drive Goa in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] via-[#e8c96d] to-[#c9a84c]">
                Pure Luxury
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
              Handpicked premium vehicles delivered to your hotel, villa, or airport.
              Self-drive freedom or chauffeur comfort — your choice.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
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
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/25 text-white font-semibold text-base rounded-xl hover:bg-white/5 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +91 98765 43210
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                { value: "500+", label: "Happy Customers" },
                { value: "30+", label: "Premium Vehicles" },
                { value: "5★", label: "Average Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-black text-white">{s.value}</p>
                  <p className="text-white/40 text-xs uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ================================================================
          USP STRIP
      ================================================================ */}
      <section className="bg-[#060b18] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {USP_ITEMS.map((item) => (
              <div key={item.title} className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] shrink-0 group-hover:bg-[#c9a84c]/20 transition-colors duration-200">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURED FLEET
      ================================================================ */}
      <section className="bg-[#0a0f1e] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-2">Handpicked for You</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Vehicles</h2>
              <p className="text-white/40 mt-2 text-sm max-w-xs">Our most popular picks — available today, delivered to you.</p>
            </div>
            <Link
              href="/fleet"
              id="homepage-view-all-link"
              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all duration-200"
            >
              View all {allVehicles.length} vehicles
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredVehicles.length === 0 ? (
            <div className="text-center py-16 text-white/30">Fleet data loading — check back shortly.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          WHY US
      ================================================================ */}
      <section className="bg-[#060b18] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-3">The 3M Difference</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Why Travellers Choose Us</h2>
            <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">
              We don&apos;t just rent cars. We deliver experiences — backed by local expertise and real service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Showroom-Condition Fleet",
                desc: "Every vehicle is professionally detailed, mechanically inspected, and verified before each rental. No surprises, ever.",
                icon: "🏎️",
              },
              {
                number: "02",
                title: "Zero-Wait Airport Pickup",
                desc: "Your car is at the terminal the moment your flight lands. We track your flight live, so no stress if you're delayed.",
                icon: "✈️",
              },
              {
                number: "03",
                title: "White-Glove Concierge",
                desc: "A personal coordinator handles hotel delivery, road assistance, and any request 24/7 — because your time matters.",
                icon: "🤝",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#c9a84c]/25 transition-all duration-300"
              >
                <div className="absolute top-6 right-6 text-6xl font-black text-white/[0.04] group-hover:text-[#c9a84c]/[0.08] transition-colors duration-300 select-none">
                  {item.number}
                </div>
                <div className="text-3xl mb-5">{item.icon}</div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS
      ================================================================ */}
      <section className="bg-[#0a0f1e] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Real Reviews</p>
            <h2 className="text-3xl font-black text-white">What Our Guests Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Menon",
                location: "Mumbai",
                text: "The BMW 3 Series was immaculate. Delivered to our hotel at 6am without any fuss. Will book again every time we visit Goa.",
                rating: 5,
                vehicle: "BMW 3 Series",
              },
              {
                name: "Rahul Sharma",
                location: "Bangalore",
                text: "Booked the Creta for 5 days. Brilliant condition, GPS included, fuel full. The team was always reachable. Highly recommend!",
                rating: 5,
                vehicle: "Hyundai Creta",
              },
              {
                name: "Sarah Williams",
                location: "Dubai",
                text: "Flying in for a wedding, 3M had the GLE ready at Mopa airport. Seamless experience. Absolutely premium service.",
                rating: 5,
                vehicle: "Mercedes-Benz GLE",
              },
            ].map((review) => (
              <div key={review.name} className="p-7 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#c9a84c]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <p className="text-white font-semibold text-sm">{review.name}</p>
                    <p className="text-white/30 text-xs">{review.location}</p>
                  </div>
                  <span className="text-[#c9a84c] text-xs font-medium px-2.5 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20">
                    {review.vehicle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FINAL CTA
      ================================================================ */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 bg-[#060b18]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c9a84c]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Start Your Journey</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Ready to explore Goa in style?
          </h2>
          <p className="text-white/50 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
            Browse our curated fleet and lock in your vehicle in under 2 minutes. No hidden fees, no surprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/fleet"
              id="bottom-cta-btn"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] font-bold text-base rounded-xl hover:shadow-2xl hover:shadow-[#c9a84c]/30 hover:-translate-y-1 transition-all duration-300"
            >
              Browse the Full Fleet
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/auth/register"
              id="bottom-register-btn"
              className="inline-flex items-center gap-2 px-10 py-4 border border-white/20 text-white font-semibold text-base rounded-xl hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
