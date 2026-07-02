import Link from "next/link";

export const metadata = {
  title: "Airport Car Rentals Goa (GOX & GOI) — 3M Car Rentals",
  description:
    "Self-drive car rentals delivered directly to Mopa Airport (GOX) and Dabolim Airport (GOI). Skip the taxi lines and start your Goa holiday immediately.",
};

export default function AirportPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#060b18]">
        {/* Faint grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold tracking-[0.15em] uppercase mb-6">
            🛫 Zero-Wait Handover
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Goa Airport Self-Drive{" "}
            <span className="bg-gradient-to-r from-[#c9a84c] via-[#e8c96d] to-[#c9a84c] bg-clip-text text-transparent">
              Car Rentals
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Skip the taxi lines and surge pricing. We deliver your selected luxury or economy vehicle directly to Mopa Airport (GOX) or Dabolim Airport (GOI) terminal gates.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fleet"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm shadow-lg shadow-[#c9a84c]/20 hover:-translate-y-1 transition-all duration-300"
            >
              Browse Fleet for Airport Pickup
            </Link>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border border-white/15 text-white/80 text-sm hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              Chat with Concierge
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          AIRPORTS HUB DETAIL SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-3">Serviced Hubs</p>
          <h2 className="text-white font-black text-3xl sm:text-4xl">Available Airports in Goa</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mopa Airport (GOX) */}
          <div className="group relative p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-[#c9a84c]/20 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#c9a84c] font-bold text-lg tracking-wider">GOX</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase">
                  North Goa Gateway
                </span>
              </div>
              <h3 className="text-white font-black text-2xl mb-4">Manohar International Airport (Mopa)</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Located in extreme North Goa, Mopa handles the bulk of new domestic and international arrivals. Hiring a taxi from Mopa to coastal hubs can be extremely expensive. Let us hand over the keys right outside the terminal gate.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs">Distance to Morjim / Ashwem</span>
                  <span className="text-white text-xs font-semibold">28 km (~45 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs">Distance to Calangute / Baga</span>
                  <span className="text-white text-xs font-semibold">32 km (~50 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs">Distance to Panaji (Capital)</span>
                  <span className="text-white text-xs font-semibold">35 km (~50 mins)</span>
                </div>
              </div>
            </div>
            <Link
              href="/fleet?airport=gox"
              className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-[#c9a84c] hover:text-[#0a0f1e] hover:border-[#c9a84c] transition-all duration-200"
            >
              Book at Mopa Airport
            </Link>
          </div>

          {/* Dabolim Airport (GOI) */}
          <div className="group relative p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-[#c9a84c]/20 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#c9a84c] font-bold text-lg tracking-wider">GOI</span>
                <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold uppercase">
                  Central & South Gateway
                </span>
              </div>
              <h3 className="text-white font-black text-2xl mb-4">Dabolim International Airport</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Goa&apos;s central airport, Dabolim, is located near Vasco da Gama. It is highly convenient for guests heading to Panaji, Miramar, or South Goa destinations like Colva, Benaulim, and Palolem.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs">Distance to Panaji</span>
                  <span className="text-white text-xs font-semibold">26 km (~35 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs">Distance to Candolim / Calangute</span>
                  <span className="text-white text-xs font-semibold">38 km (~55 mins)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40 text-xs">Distance to Palolem (South Goa)</span>
                  <span className="text-white text-xs font-semibold">60 km (~75 mins)</span>
                </div>
              </div>
            </div>
            <Link
              href="/fleet?airport=goi"
              className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-[#c9a84c] hover:text-[#0a0f1e] hover:border-[#c9a84c] transition-all duration-200"
            >
              Book at Dabolim Airport
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROCESS TIMELINE
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#060b18] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-3">Seamless Handover</p>
            <h2 className="text-white font-black text-3xl sm:text-4xl">How Airport Self-Drive Works</h2>
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
              <div key={p.step} className="flex flex-col p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300">
                <span className="text-[#c9a84c] font-black text-5xl mb-6 select-none opacity-40">{p.step}</span>
                <h3 className="text-white font-bold text-lg mb-3">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FAQS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-3">Common Questions</p>
          <h2 className="text-white font-black text-3xl sm:text-4xl">Airport Transfer FAQs</h2>
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
            <div key={faq.q} className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-bold text-base sm:text-lg mb-2">{faq.q}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
