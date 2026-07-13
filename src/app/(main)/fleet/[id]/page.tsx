import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getVehicleById } from "@/services/fleet.service";
import BookingForm from "@/components/booking/BookingForm";
import VehicleDetailGallery from "@/components/fleet/VehicleDetailGallery";

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
  hatchback:    { gradient: "from-[#1A1916] via-[#1E1D1A] to-[#121210]",    accent: "#94a3b8" },
  sedan:        { gradient: "from-[#1A1916] via-[#1C1B18] to-[#121210]",    accent: "#D4B96A" },
  suv:          { gradient: "from-[#1A1916] via-[#1D1C19] to-[#121210]",    accent: "#6ee7b7" },
  luxury:       { gradient: "from-[#1E1B14] via-[#1A1710] to-[#121210]",    accent: "#C9A84C" },
  "premium-suv":{ gradient: "from-[#1A1916] via-[#1D1B18] to-[#121210]",    accent: "#C9A84C" },
};

// ─── SVG car silhouette ───────────────────────────────────────────────────────
function CarSilhouetteLarge({ slug }: { slug: string }) {
  const baseClass = "w-full h-full text-white/10";
  switch (slug) {
    case "hatchback":
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M180 55H20a6 6 0 01-6-6V44l10-20a8 8 0 016.5-3.5h119a8 8 0 016.5 3.5L180 48v1a6 6 0 01-6 6zm-145 0v5a5 5 0 005 5h130a5 5 0 005-5v-5" opacity=".6"/>
          <circle cx="50" cy="62" r="10" className="text-white/15" fill="currentColor"/>
          <circle cx="150" cy="62" r="10" className="text-white/15" fill="currentColor"/>
          <circle cx="50" cy="62" r="5" className="text-white/5" fill="currentColor"/>
          <circle cx="150" cy="62" r="5" className="text-white/5" fill="currentColor"/>
          <path d="M60 24h80l8 16H52z" opacity=".3"/>
        </svg>
      );
    case "suv":
    case "premium-suv":
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M175 52H25a8 8 0 01-8-8V38l12-22a10 10 0 018-4h122a10 10 0 018 4l12 22v6a8 8 0 01-8 8zm-150 0v6a6 6 0 006 6h138a6 6 0 006-6v-6" opacity=".6"/>
          <circle cx="55" cy="62" r="11" className="text-white/15" fill="currentColor"/>
          <circle cx="145" cy="62" r="11" className="text-white/15" fill="currentColor"/>
          <circle cx="55" cy="62" r="5.5" className="text-white/5" fill="currentColor"/>
          <circle cx="145" cy="62" r="5.5" className="text-white/5" fill="currentColor"/>
          <path d="M65 18h70l10 18H55z" opacity=".3"/>
          <rect x="30" y="35" width="20" height="12" rx="2" opacity=".2"/>
          <rect x="150" y="35" width="20" height="12" rx="2" opacity=".2"/>
        </svg>
      );
    case "luxury":
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M185 54H15a5 5 0 01-5-5V44l8-18a8 8 0 017-4h150a8 8 0 017 4l8 18v5a5 5 0 01-5 5zm-170 0v6a5 5 0 005 5h150a5 5 0 005-5v-6" opacity=".6"/>
          <circle cx="48" cy="63" r="10" className="text-white/15" fill="currentColor"/>
          <circle cx="152" cy="63" r="10" className="text-white/15" fill="currentColor"/>
          <circle cx="48" cy="63" r="5" className="text-white/5" fill="currentColor"/>
          <circle cx="152" cy="63" r="5" className="text-white/5" fill="currentColor"/>
          <path d="M70 23h60l12 19H58z" opacity=".4"/>
          <path d="M15 43h170" stroke="currentColor" strokeWidth="0.5" opacity=".2"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 80" className={baseClass} fill="currentColor">
          <path d="M182 53H18a7 7 0 01-7-7V41l10-19a9 9 0 017.5-4h143a9 9 0 017.5 4l10 19v5a7 7 0 01-7 7zm-164 0v6a5 5 0 005 5h154a5 5 0 005-5v-6" opacity=".6"/>
          <circle cx="52" cy="62" r="10" className="text-white/15" fill="currentColor"/>
          <circle cx="148" cy="62" r="10" className="text-white/15" fill="currentColor"/>
          <circle cx="52" cy="62" r="5" className="text-white/5" fill="currentColor"/>
          <circle cx="148" cy="62" r="5" className="text-white/5" fill="currentColor"/>
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
    <div className="min-h-screen bg-[#121210]">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-0">
        <nav className="flex items-center gap-2 text-xs text-white/30">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/fleet" className="hover:text-white/60 transition-colors">Fleet</Link>
          <span>/</span>
          <span className="text-[#C9A84C]/80">{vehicle.brand} {vehicle.model}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* ── Left: Vehicle Detail ── */}
          <div className="lg:col-span-3 space-y-10">

            {/* Hero visual */}
            <VehicleDetailGallery
              images={(vehicle as any).images || []}
              brand={vehicle.brand}
              model={vehicle.model}
              fallbackElement={
                <div className={`relative bg-gradient-to-br ${config.gradient} overflow-hidden h-72 sm:h-80 border border-white/10 rounded-[20px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]`}>
                  {/* Ambient glow */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-3xl opacity-20"
                    style={{ backgroundColor: config.accent }}
                  />
                  {/* Reflective floor */}
                  <div className="absolute bottom-16 left-12 right-12 h-px bg-white/5" />
                  {/* Silhouette */}
                  <div className="absolute inset-x-8 sm:inset-x-16 bottom-12 top-10">
                    <CarSilhouetteLarge slug={slug} />
                  </div>
                  {/* Status badge */}
                  {vehicle.availability_status === "available" && (
                    <span className="absolute top-5 right-5 flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm z-10 rounded-[20px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available Now
                    </span>
                  )}
                  {/* Category badge */}
                  <span
                    className="absolute top-5 left-5 px-3.5 py-1.5 text-[10px] tracking-wider uppercase border backdrop-blur-sm z-10 rounded-[20px]"
                    style={{ color: config.accent, borderColor: `${config.accent}25`, backgroundColor: `${config.accent}0A` }}
                  >
                    {vehicle.category?.name ?? "Vehicle"}
                  </span>
                </div>
              }
            />

            {/* Vehicle name & pricing */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(232, 220, 200, 0.4)",
                }}
              >
                {vehicle.brand}
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: 400,
                  color: "#ffffff",
                  lineHeight: 1.15,
                  marginTop: "0.5rem",
                }}
              >
                {vehicle.model}
                {vehicle.variant && (
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      fontSize: "1.5rem",
                      color: "rgba(232, 220, 200, 0.3)",
                      marginLeft: "0.75rem",
                    }}
                  >
                    {vehicle.variant}
                  </span>
                )}
              </h1>

              {/* Pricing pills */}
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex flex-col items-start px-6 py-4 bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] shadow-sm">
                  <p
                    className="text-[#E8DCC8]/40 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Daily Rate
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.75rem",
                      fontWeight: 500,
                      color: "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    {formatINR(vehicle.daily_rate)}
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: "0.875rem",
                        color: "rgba(232, 220, 200, 0.3)",
                      }}
                    >
                      {" "}/day
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-start px-6 py-4 bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] shadow-sm">
                  <p
                    className="text-[#E8DCC8]/40 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Hourly Rate
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.75rem",
                      fontWeight: 500,
                      color: "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    {formatINR(vehicle.hourly_rate)}
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: "0.875rem",
                        color: "rgba(232, 220, 200, 0.3)",
                      }}
                    >
                      {" "}/hr
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-start px-6 py-4 bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-[20px] shadow-sm">
                  <p
                    className="text-[#C9A84C]/80 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Deposit
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.75rem",
                      fontWeight: 500,
                      color: "#C9A84C",
                      lineHeight: 1,
                    }}
                  >
                    {formatINR(vehicle.security_deposit)}
                    <span
                      className="text-[#C9A84C]/50"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: "0.875rem",
                      }}
                    >
                      {" "}refundable
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Specs grid */}
            <div>
              <h2
                className="text-white mb-6"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                }}
              >
                Vehicle Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-start gap-3.5 p-5 bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] shadow-sm"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{spec.icon}</span>
                    <div className="min-w-0">
                      <p
                        className="text-[#E8DCC8]/40 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {spec.label}
                      </p>
                      <p
                        className="text-white font-medium truncate mt-1"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {spec.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h2
                  className="text-white mb-6"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    fontWeight: 400,
                  }}
                >
                  What&apos;s Included
                </h2>
                <div className="space-y-4">
                  {[
                    "Comprehensive insurance coverage",
                    "24/7 roadside assistance",
                    "Airport or hotel delivery",
                    "Full tank of fuel on pickup",
                    "GPS navigation (on request)",
                    "Clean, detailed vehicle guaranteed",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-[#E8DCC8]/60 font-light"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <div className="w-5 h-5 bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center shrink-0 rounded-full">
                        <svg className="w-3 h-3 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {((vehicle as any).features && (vehicle as any).features.length > 0) && (
                <div>
                  <h2
                    className="text-white mb-6"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                    }}
                  >
                    Convenience Features
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {((vehicle as any).features as string[]).map((feat) => (
                      <div
                        key={feat}
                        className="flex items-center gap-2.5 text-xs text-[#E8DCC8]/70 bg-white/[0.08] backdrop-blur-xl border border-white/12 px-4 py-3 font-light rounded-[20px]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span className="text-[#C9A84C]">✦</span> {feat}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Booking Form ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-8">
            <div className="bg-white/[0.08] backdrop-blur-2xl border border-white/12 p-8 rounded-[20px] shadow-[0_15px_35px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]">
              <div className="mb-8">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C9A84C]/25 text-[#C9A84C] text-[10px] font-bold uppercase tracking-wider mb-4 rounded-[20px]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Reserve Now
                </span>
                <h2
                  className="text-white font-normal"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.75rem",
                  }}
                >
                  Book This Vehicle
                </h2>
                <p
                  className="text-[#E8DCC8]/40 text-sm mt-2 font-light"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  No payment required now. We&apos;ll confirm your booking within 2 hours.
                </p>
              </div>
              <BookingForm vehicle={vehicle} />
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: "🛡️", text: "Fully Insured" },
                { icon: "📞", text: "24/7 Support" },
                { icon: "✅", text: "Instant Booking" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="bg-white/[0.08] backdrop-blur-xl border border-white/12 py-4 rounded-[20px]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <p className="text-xl">{b.icon}</p>
                  <p className="text-[#E8DCC8]/40 text-[10px] font-semibold uppercase tracking-wider mt-2">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
