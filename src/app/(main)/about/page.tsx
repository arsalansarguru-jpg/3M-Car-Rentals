import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us — 3M Car Rentals",
  description:
    "Learn about the story, values, and quality commitment of 3M Car Rentals. We are Goa's leading premium self-drive car rental agency.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#121210]">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#1A1916]">
        {/* Faint grid background */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#C9A84C]/10" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-6 h-px bg-[#C9A84C]/40" />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#C9A84C",
              }}
            >
              The 3M Story
            </span>
            <span className="block w-6 h-px bg-[#C9A84C]/40" />
          </div>
          <h1
            className="text-white tracking-wide mb-6 leading-tight max-w-4xl mx-auto"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 300,
            }}
          >
            Redefining Travel in{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8DCC8, #C9A84C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Goa
            </span>
          </h1>
          <p
            className="leading-relaxed max-w-2xl mx-auto mb-10 text-[#E8DCC8]/60"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.125rem",
              fontWeight: 300,
            }}
          >
            Founded with a single mission: to deliver a flawless, high-end, self-drive rental experience that matches the beauty and freedom of Goa.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          OUR STORY SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="mb-4"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#C9A84C",
              }}
            >
              Our Genesis
            </p>
            <h2
              className="text-white mb-8"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 400,
                letterSpacing: "0.01em",
              }}
            >
              Built by Travellers, for Travellers
            </h2>
            <div
              className="space-y-6 text-[#E8DCC8]/60 leading-relaxed font-light"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
              }}
            >
              <p>
                We noticed that renting a car in Goa was often plagued by poor vehicle quality, lack of transparency in fuel policies, and unreliable drop-off handovers.
              </p>
              <p>
                At 3M Car Rentals, we decided to do things differently. We treat every vehicle as if it were our own. That means keeping all cars in pristine mechanical condition, detail cleaning them before every booking, and offering a white-glove concierge support network that operates around the clock.
              </p>
              <p>
                Whether you need a compact hatchback to explore narrow beach lanes, a rugged SUV to head up to Dudhsagar, or a luxury saloon to attend a high-profile coastal event, we supply the freedom of mobility without any compromises.
              </p>
            </div>
          </div>

          <div className="relative aspect-video lg:aspect-square border border-[#C9A84C]/10 overflow-hidden group">
            {/* Background Image */}
            <Image
              src="/about-car.png"
              alt="Luxury sports car with golden accents"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none opacity-80"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121210] via-[#121210]/40 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 z-10 flex flex-col justify-end h-full">
              <div
                className="w-16 h-16 border border-[#C9A84C]/25 flex items-center justify-center mb-6"
                style={{ background: "rgba(18, 18, 16, 0.6)" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "#C9A84C",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                  }}
                >
                  3M
                </span>
              </div>
              <h3
                className="text-white mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                }}
              >
                Impeccable Standards
              </h3>
              <p
                className="text-[#E8DCC8]/50 max-w-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  fontWeight: 300,
                }}
              >
                Goa&apos;s premium fleet. Verified, detailed, and delivered wherever you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CORE PILLARS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1A1916] py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="block w-6 h-px bg-[#C9A84C]/40" />
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                }}
              >
                Our Values
              </p>
              <span className="block w-6 h-px bg-[#C9A84C]/40" />
            </div>
            <h2
              className="text-white"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 400,
              }}
            >
              What Defines 3M Car Rentals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏎️",
                title: "Showroom-Condition Fleet",
                desc: "We own, maintain, and detail every single car. Every vehicle is deep-cleaned and undergoes a comprehensive 40-point safety and performance inspection before its keys are handed over.",
              },
              {
                icon: "💎",
                title: "100% Honest Pricing",
                desc: "No hidden charges, no airport delivery surprises, and no vague security deposit terms. What you see during online booking is exactly what you pay.",
              },
              {
                icon: "🤝",
                title: "24/7 Concierge Network",
                desc: "We are with you on every road. Our dedicated support team handles flight tracking delays, hotel deliver adjustments, and roadside concierge services day or night.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="group relative p-10 bg-white/[0.015] border border-white/[0.06] hover:border-[#C9A84C]/20 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
              >
                <div className="text-4xl mb-8">{pillar.icon}</div>
                <h3
                  className="text-white mb-3"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    fontWeight: 400,
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="text-[#E8DCC8]/50 leading-relaxed font-light"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                  }}
                >
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MILESTONES & STATS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div
          className="max-w-4xl mx-auto p-12 relative overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.01)",
            border: "1px solid rgba(201, 168, 76, 0.1)",
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 rounded-full bg-[#C9A84C]/5 blur-[80px] pointer-events-none" />

          <h2
            className="text-white mb-10 relative z-10"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 400,
            }}
          >
            Our Journey in Numbers
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
            {[
              { value: "500+", label: "Delighted Guests" },
              { value: "30+", label: "Verified Vehicles" },
              { value: "100%", label: "Transparency Guaranteed" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-white mb-2"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "3rem",
                    fontWeight: 300,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(212, 197, 176, 0.4)",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1A1916] py-24 border-t border-[#C9A84C]/8">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.5rem",
              fontWeight: 400,
            }}
          >
            Experience Goa at Your Own Pace
          </h2>
          <p
            className="leading-relaxed max-w-md mx-auto mb-10 text-[#E8DCC8]/50"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              fontWeight: 300,
            }}
          >
            Choose self-drive freedom. Secure your keys online and have them waiting for you at the airport arrivals gate.
          </p>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#C9A84C] text-[#121210] hover:bg-[#D4B96A] transition-all duration-300 shadow-lg shadow-[#C9A84C]/10 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Explore the Fleet
          </Link>
        </div>
      </section>
    </div>
  );
}
