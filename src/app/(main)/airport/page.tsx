import Link from "next/link";

export const metadata = {
  title: "Airport Car Rentals Goa (GOX & GOI) — 3M Car Rentals",
  description:
    "Self-drive car rentals delivered directly to Mopa Airport (GOX) and Dabolim Airport (GOI). Skip the taxi lines and start your Goa holiday immediately.",
};

export default function AirportPage() {
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
              Zero-Wait Handover
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
            Goa Airport Self-Drive{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8DCC8, #C9A84C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Car Rentals
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
            Skip the taxi lines and surge pricing. We deliver your selected luxury or economy vehicle directly to Mopa Airport (GOX) or Dabolim Airport (GOI) terminal gates.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/fleet"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#C9A84C] text-[#121210] hover:bg-[#D4B96A] transition-all duration-300 shadow-lg shadow-[#C9A84C]/10 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              Browse Fleet for Airport Pickup
            </Link>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 border border-[#C9A84C]/25 text-[#C9A84C]/70 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-all duration-300 text-xs font-medium uppercase tracking-[0.14em]"
            >
              Chat with Concierge
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          AIRPORTS HUB DETAIL SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
              Serviced Hubs
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
            Available Airports in Goa
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mopa Airport (GOX) */}
          <div className="group relative p-10 bg-white/[0.015] border border-white/[0.06] hover:border-[#C9A84C]/20 transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "#C9A84C",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                  }}
                >
                  GOX
                </span>
                <span
                  className="px-3.5 py-1 border border-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-medium tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  North Goa Gateway
                </span>
              </div>
              <h3
                className="text-white mb-4"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.75rem",
                  fontWeight: 400,
                }}
              >
                Manohar International Airport (Mopa)
              </h3>
              <p
                className="leading-relaxed mb-8 text-[#E8DCC8]/50"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  fontWeight: 300,
                }}
              >
                Located in extreme North Goa, Mopa handles the bulk of new domestic and international arrivals. Hiring a taxi from Mopa to coastal hubs can be extremely expensive. Let us hand over the keys right outside the terminal gate.
              </p>

              <div
                className="space-y-4 mb-10 text-[#E8DCC8]/60 font-light"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              >
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Distance to Morjim / Ashwem</span>
                  <span className="text-white font-medium">28 km (~45 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Distance to Calangute / Baga</span>
                  <span className="text-white font-medium">32 km (~50 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Distance to Panaji (Capital)</span>
                  <span className="text-white font-medium">35 km (~50 mins)</span>
                </div>
              </div>
            </div>
            <Link
              href="/fleet?airport=gox"
              className="inline-flex items-center justify-center gap-2 w-full py-4 border border-[#C9A84C]/25 text-[#C9A84C]/70 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-all duration-300 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              Book at Mopa Airport
            </Link>
          </div>

          {/* Dabolim Airport (GOI) */}
          <div className="group relative p-10 bg-white/[0.015] border border-white/[0.06] hover:border-[#C9A84C]/20 transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "#C9A84C",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                  }}
                >
                  GOI
                </span>
                <span
                  className="px-3.5 py-1 border border-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-medium tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Central & South Gateway
                </span>
              </div>
              <h3
                className="text-white mb-4"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.75rem",
                  fontWeight: 400,
                }}
              >
                Dabolim International Airport
              </h3>
              <p
                className="leading-relaxed mb-8 text-[#E8DCC8]/50"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  fontWeight: 300,
                }}
              >
                Goa&apos;s central airport, Dabolim, is located near Vasco da Gama. It is highly convenient for guests heading to Panaji, Miramar, or South Goa destinations like Colva, Benaulim, and Palolem.
              </p>

              <div
                className="space-y-4 mb-10 text-[#E8DCC8]/60 font-light"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem" }}
              >
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Distance to Panaji</span>
                  <span className="text-white font-medium">26 km (~35 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Distance to Candolim / Calangute</span>
                  <span className="text-white font-medium">38 km (~55 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Distance to Palolem (South Goa)</span>
                  <span className="text-white font-medium">60 km (~75 mins)</span>
                </div>
              </div>
            </div>
            <Link
              href="/fleet?airport=goi"
              className="inline-flex items-center justify-center gap-2 w-full py-4 border border-[#C9A84C]/25 text-[#C9A84C]/70 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-all duration-300 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              Book at Dabolim Airport
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROCESS TIMELINE
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
                Seamless Handover
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
              How Airport Self-Drive Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                step: "01",
                title: "Book & Share Flight Details",
                desc: "Choose your vehicle and input your arrival flight number. This allows us to track your flight in real time for early landings or delays.",
              },
              {
                step: "02",
                title: "Live Handover at Arrival",
                desc: "Our delivery representative will meet you right outside the airport arrivals gate, complete a quick physical check, and hand over the keys.",
              },
              {
                step: "03",
                title: "Departing Handback",
                desc: "At the end of your trip, meet our representative at the airport departures gate. A quick key handover and inspection, and you're ready to fly.",
              },
            ].map((p) => (
              <div
                key={p.step}
                className="flex flex-col p-10 bg-white/[0.015] border border-white/[0.06] hover:border-[#C9A84C]/15 transition-all duration-500"
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "3.5rem",
                    fontWeight: 300,
                    color: "#C9A84C",
                    opacity: 0.5,
                    lineHeight: 1,
                    marginBottom: "1.5rem",
                  }}
                >
                  {p.step}
                </span>
                <h3
                  className="text-white mb-3"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    fontWeight: 400,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-[#E8DCC8]/50 leading-relaxed font-light"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                  }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FAQS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
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
              Common Questions
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
            Airport Transfer FAQs
          </h2>
        </div>

        <div className="space-y-6">
          {[
            {
              q: "What happens if my flight is delayed?",
              a: "We track all flights live via their flight numbers. If your flight is delayed, our representative will adjust their schedule accordingly to ensure your vehicle is ready the moment you exit.",
            },
            {
              q: "Are there additional airport delivery fees?",
              a: "We provide competitive, transparent delivery pricing depending on the rental duration. All charges are shown clearly during the booking process before confirmation.",
            },
            {
              q: "Do you deliver late at night or early in the morning?",
              a: "Yes, our delivery operations at Mopa (GOX) and Dabolim (GOI) run 24/7. However, booking in advance is highly recommended to secure flight-matching allocations.",
            },
            {
              q: "What documentation do I need at handover?",
              a: "You will need to present your original valid driving license and a government-issued ID card (like Aadhaar or Passport) to verify against your booking profile details.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="p-8 bg-white/[0.015] border border-white/[0.06]"
              style={{
                fontFamily: "var(--font-body)",
              }}
            >
              <h4
                className="text-white mb-3"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.25rem",
                  fontWeight: 400,
                }}
              >
                {faq.q}
              </h4>
              <p
                className="text-[#E8DCC8]/50 leading-relaxed font-light text-sm"
                style={{
                  fontWeight: 300,
                }}
              >
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
