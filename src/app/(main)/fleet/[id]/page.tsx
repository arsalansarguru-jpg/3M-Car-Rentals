import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getVehicleById } from "@/services/fleet.service";
import BookingForm from "@/components/booking/BookingForm";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VehicleDetailPageProps {
  params: Promise<{ id: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

const CATEGORY_CONFIG: Record<string, { gradient: string; accent: string }> = {
  hatchback:    { gradient: "from-slate-700 via-slate-800 to-[#0a0f1e]",     accent: "#64748b" },
  sedan:        { gradient: "from-blue-800 via-blue-900 to-[#0a0f1e]",       accent: "#3b82f6" },
  suv:          { gradient: "from-emerald-800 via-emerald-900 to-[#0a0f1e]", accent: "#10b981" },
  luxury:       { gradient: "from-[#7c5c18] via-[#4a3610] to-[#0a0f1e]",    accent: "#c9a84c" },
  "premium-suv":{ gradient: "from-purple-800 via-purple-900 to-[#0a0f1e]",   accent: "#a855f7" },
};

// ─── SVG car silhouette (reused from VehicleCard) ─────────────────────────────
function CarSilhouetteLarge({ slug }: { slug: string }) {
  const baseClass = "w-full h-full text-white/20";
  switch (slug) {
    case "hatchback":
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M180 55H20a6 6 0 01-6-6V44l10-20a8 8 0 016.5-3.5h119a8 8 0 016.5 3.5L180 48v1a6 6 0 01-6 6zm-145 0v5a5 5 0 005 5h130a5 5 0 005-5v-5" opacity=".6"/>
          <circle cx="50" cy="62" r="10" className="text-white/30" fill="currentColor"/>
          <circle cx="150" cy="62" r="10" className="text-white/30" fill="currentColor"/>
          <circle cx="50" cy="62" r="5" className="text-white/10" fill="currentColor"/>
          <circle cx="150" cy="62" r="5" className="text-white/10" fill="currentColor"/>
          <path d="M60 24h80l8 16H52z" opacity=".3"/>
        </svg>
      );
    case "suv":
    case "premium-suv":
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M175 52H25a8 8 0 01-8-8V38l12-22a10 10 0 018-4h122a10 10 0 018 4l12 22v6a8 8 0 01-8 8zm-150 0v6a6 6 0 006 6h138a6 6 0 006-6v-6" opacity=".6"/>
          <circle cx="55" cy="62" r="11" className="text-white/30" fill="currentColor"/>
          <circle cx="145" cy="62" r="11" className="text-white/30" fill="currentColor"/>
          <circle cx="55" cy="62" r="5.5" className="text-white/10" fill="currentColor"/>
          <circle cx="145" cy="62" r="5.5" className="text-white/10" fill="currentColor"/>
          <path d="M65 18h70l10 18H55z" opacity=".3"/>
          <rect x="30" y="35" width="20" height="12" rx="2" opacity=".2"/>
          <rect x="150" y="35" width="20" height="12" rx="2" opacity=".2"/>
        </svg>
      );
    case "luxury":
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M185 54H15a5 5 0 01-5-5V44l8-18a8 8 0 017-4h150a8 8 0 017 4l8 18v5a5 5 0 01-5 5zm-170 0v6a5 5 0 005 5h150a5 5 0 005-5v-6" opacity=".6"/>
          <circle cx="48" cy="63" r="10" className="text-white/30" fill="currentColor"/>
          <circle cx="152" cy="63" r="10" className="text-white/30" fill="currentColor"/>
          <circle cx="48" cy="63" r="5" className="text-white/10" fill="currentColor"/>
          <circle cx="152" cy="63" r="5" className="text-white/10" fill="currentColor"/>
          <path d="M70 23h60l12 19H58z" opacity=".4"/>
          <path d="M15 43h170" stroke="currentColor" strokeWidth="0.5" opacity=".2"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M182 53H18a7 7 0 01-7-7V41l10-19a9 9 0 017.5-4h143a9 9 0 017.5 4l10 19v5a7 7 0 01-7 7zm-164 0v6a5 5 0 005 5h154a5 5 0 005-5v-6" opacity=".6"/>
          <circle cx="52" cy="62" r="10" className="text-white/30" fill="currentColor"/>
          <circle cx="148" cy="62" r="10" className="text-white/30" fill="currentColor"/>
          <circle cx="52" cy="62" r="5" className="text-white/10" fill="currentColor"/>
          <circle cx="148" cy="62" r="5" className="text-white/10" fill="currentColor"/>
          <path d="M68 21h64l10 20H58z" opacity=".35"/>
        </svg>
      );
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: VehicleDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) return { title: "Vehicle Not Found — 3M Car Rentals" };
  return {
    title: `${vehicle.year} ${vehicle.brand} ${vehicle.model} — Book Now | 3M Car Rentals Goa`,
    description: `Rent the ${vehicle.brand} ${vehicle.model} in Goa from ${formatINR(vehicle.daily_rate)}/day. ${vehicle.transmission}, ${vehicle.fuel_type}, ${vehicle.seating_capacity} seats. Fully insured, airport delivery available.`,
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) notFound();

  const slug = vehicle.category?.slug ?? "sedan";
  const config = CATEGORY_CONFIG[slug] ?? CATEGORY_CONFIG.sedan;

  const specs = [
    { icon: "⛽", label: "Fuel",         value: vehicle.fuel_type },
    { icon: "⚙️", label: "Transmission", value: vehicle.transmission },
    { icon: "👤", label: "Seats",        value: `${vehicle.seating_capacity} Passengers` },
    ...(vehicle.luggage_capacity ? [{ icon: "🧳", label: "Luggage", value: `${vehicle.luggage_capacity} Bags` }] : []),
    { icon: "📅", label: "Year",         value: String(vehicle.year) },
    { icon: "🪪", label: "Reg. No",      value: vehicle.registration_number },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
        <nav className="flex items-center gap-2 text-xs text-white/30">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/fleet" className="hover:text-white/60 transition-colors">Fleet</Link>
          <span>/</span>
          <span className="text-white/60">{vehicle.brand} {vehicle.model}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* ── Left: Vehicle Detail ── */}
          <div className="lg:col-span-3 space-y-8">

            {/* Hero visual */}
            <div className={`relative rounded-3xl bg-gradient-to-br ${config.gradient} overflow-hidden h-72 sm:h-80`}>
              {/* Ambient glow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-3xl opacity-30"
                style={{ backgroundColor: config.accent }}
              />
              {/* Reflective floor */}
              <div className="absolute bottom-16 left-12 right-12 h-px bg-white/10" />
              {/* Silhouette */}
              <div className="absolute inset-x-8 sm:inset-x-16 bottom-12 top-10">
                <CarSilhouetteLarge slug={slug} />
              </div>
              {/* Status badge */}
              {vehicle.availability_status === "available" && (
                <span className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Available Now
                </span>
              )}
              {/* Category badge */}
              <span
                className="absolute top-5 left-5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm"
                style={{ color: config.accent, borderColor: `${config.accent}40`, backgroundColor: `${config.accent}15` }}
              >
                {vehicle.category?.name ?? "Vehicle"}
              </span>
            </div>

            {/* Vehicle name & pricing */}
            <div>
              <p className="text-white/40 text-sm font-medium tracking-wider uppercase">{vehicle.brand}</p>
              <h1 className="text-white font-black text-4xl sm:text-5xl mt-1 leading-tight">
                {vehicle.model}
                {vehicle.variant && (
                  <span className="text-white/30 font-normal text-2xl ml-3">{vehicle.variant}</span>
                )}
              </h1>

              {/* Pricing pills */}
              <div className="flex flex-wrap gap-3 mt-5">
                <div className="flex flex-col items-start px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">Daily Rate</p>
                  <p className="text-white font-black text-2xl mt-0.5">
                    {formatINR(vehicle.daily_rate)}
                    <span className="text-white/35 font-normal text-sm"> /day</span>
                  </p>
                </div>
                <div className="flex flex-col items-start px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">Hourly Rate</p>
                  <p className="text-white font-black text-2xl mt-0.5">
                    {formatINR(vehicle.hourly_rate)}
                    <span className="text-white/35 font-normal text-sm"> /hr</span>
                  </p>
                </div>
                <div className="flex flex-col items-start px-5 py-3 rounded-2xl bg-[#c9a84c]/5 border border-[#c9a84c]/20">
                  <p className="text-[#c9a84c]/60 text-[10px] font-semibold uppercase tracking-wider">Deposit</p>
                  <p className="text-[#c9a84c] font-black text-2xl mt-0.5">
                    {formatINR(vehicle.security_deposit)}
                    <span className="text-[#c9a84c]/40 font-normal text-sm"> refundable</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Specs grid */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4">Vehicle Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{spec.icon}</span>
                    <div className="min-w-0">
                      <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">{spec.label}</p>
                      <p className="text-white/80 font-semibold text-sm mt-0.5 truncate">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Comprehensive insurance coverage",
                  "24/7 roadside assistance",
                  "Airport or hotel delivery",
                  "Full tank of fuel on pickup",
                  "GPS navigation (on request)",
                  "Clean, detailed vehicle guaranteed",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-white/60">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Booking Form ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-8">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.10] p-6 sm:p-8">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold uppercase tracking-wider mb-3">
                  Reserve Now
                </span>
                <h2 className="text-white font-black text-2xl">Book This Vehicle</h2>
                <p className="text-white/40 text-sm mt-1">
                  No payment required now. We&apos;ll confirm your booking within 2 hours.
                </p>
              </div>
              <BookingForm vehicle={vehicle} />
            </div>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: "🛡️", text: "Fully Insured" },
                { icon: "📞", text: "24/7 Support" },
                { icon: "✅", text: "Instant Booking" },
              ].map((b) => (
                <div key={b.text} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                  <p className="text-xl">{b.icon}</p>
                  <p className="text-white/40 text-[10px] font-medium mt-1">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
