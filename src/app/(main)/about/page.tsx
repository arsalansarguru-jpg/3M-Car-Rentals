import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us — 3M Car Rentals",
  description:
    "Learn about the story, values, and quality commitment of 3M Car Rentals. We are Goa's leading premium self-drive car rental agency.",
};

export default function AboutPage() {
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
            ✨ The 3M Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            Redefining Travel in{" "}
            <span className="bg-gradient-to-r from-[#c9a84c] via-[#e8c96d] to-[#c9a84c] bg-clip-text text-transparent">
              Goa
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Founded with a single mission: to deliver a flawless, high-end, self-drive rental experience that matches the beauty and freedom of Goa.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          OUR STORY SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-3">Our Genesis</p>
            <h2 className="text-white font-black text-3xl sm:text-4xl mb-6">Built by Travellers, for Travellers</h2>
            <div className="space-y-4 text-white/60 text-sm leading-relaxed">
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

          <div className="relative aspect-video lg:aspect-square rounded-2xl border border-white/10 overflow-hidden group">
            {/* Background Image */}
            <Image
              src="/about-car.png"
              alt="Luxury sports car with golden accents"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b18]/95 via-[#060b18]/60 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 z-10 flex flex-col justify-end h-full">
              <div className="w-14 h-14 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center mb-5">
                <span className="text-[#c9a84c] text-2xl font-black">3M</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Impeccable Standards</h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-sm">
                Goa&apos;s premium fleet. Verified, detailed, and delivered wherever you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CORE PILLARS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#060b18] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] font-semibold uppercase tracking-[0.2em] text-[11px] mb-3">Our Values</p>
            <h2 className="text-white font-black text-3xl sm:text-4xl">What Defines 3M Car Rentals</h2>
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
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#c9a84c]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="text-4xl mb-6">{pillar.icon}</div>
                <h3 className="text-white font-bold text-lg mb-3">{pillar.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MILESTONES & STATS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.06] p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 rounded-full bg-[#c9a84c]/5 blur-[60px] pointer-events-none" />

          <h2 className="text-white font-black text-2xl sm:text-3xl mb-8 relative z-10">Our Journey in Numbers</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
            {[
              { value: "500+", label: "Delighted Guests" },
              { value: "30+", label: "Verified Vehicles" },
              { value: "100%", label: "Transparency Guaranteed" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-white font-black text-4xl sm:text-5xl mb-2">{stat.value}</p>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#060b18] py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-white font-black text-3xl mb-4">Experience Goa at Your Own Pace</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-8">
            Choose self-drive freedom. Secure your keys online and have them waiting for you at the airport arrivals gate.
          </p>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm shadow-lg shadow-[#c9a84c]/20 hover:-translate-y-1 transition-all duration-300"
          >
            Explore the Fleet
          </Link>
        </div>
      </section>
    </div>
  );
}
