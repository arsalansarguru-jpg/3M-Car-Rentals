import type { VehicleWithCategory } from "@/types/database";
import Link from "next/link";

// ─── Category-specific SVG car silhouettes ───────────────────────────────────
// These are minimalist SVG paths for each category type.
function CarSilhouette({ slug }: { slug: string }) {
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
    default: // sedan
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

// ─── Category visual config ───────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { gradient: string; accent: string; label: string }> = {
  hatchback:    { gradient: "from-slate-700 via-slate-800 to-[#0a0f1e]", accent: "#64748b", label: "City Car" },
  sedan:        { gradient: "from-blue-800 via-blue-900 to-[#0a0f1e]",   accent: "#3b82f6", label: "Saloon" },
  suv:          { gradient: "from-emerald-800 via-emerald-900 to-[#0a0f1e]", accent: "#10b981", label: "Family SUV" },
  luxury:       { gradient: "from-[#7c5c18] via-[#4a3610] to-[#0a0f1e]", accent: "#c9a84c", label: "Luxury" },
  "premium-suv":{ gradient: "from-purple-800 via-purple-900 to-[#0a0f1e]", accent: "#a855f7", label: "Premium" },
};

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface VehicleCardProps {
  vehicle: VehicleWithCategory;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const slug = vehicle.category?.slug ?? "sedan";
  const config = CATEGORY_CONFIG[slug] ?? CATEGORY_CONFIG.sedan;

  return (
    <article
      className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-[#c9a84c]/30 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden"
      aria-label={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
    >
      {/* ── Visual header ── */}
      <div className={`relative h-52 bg-gradient-to-br ${config.gradient} overflow-hidden`}>
        {/* Ambient glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: config.accent }}
        />
        {/* Reflective floor line */}
        <div className="absolute bottom-12 left-8 right-8 h-px bg-white/10" />
        {/* Car silhouette */}
        <div className="absolute inset-x-6 bottom-8 top-8">
          <CarSilhouette slug={slug} />
        </div>
        {/* Category label badge */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm"
          style={{ color: config.accent, borderColor: `${config.accent}40`, backgroundColor: `${config.accent}15` }}
        >
          {config.label}
        </span>
        {/* Availability badge */}
        {vehicle.availability_status === "available" && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white/40 text-xs font-medium tracking-wider uppercase">{vehicle.brand}</p>
            <h3 className="text-white font-black text-xl leading-tight mt-0.5">
              {vehicle.model}
              {vehicle.variant && (
                <span className="text-white/35 font-normal text-sm ml-2">{vehicle.variant}</span>
              )}
            </h3>
          </div>
          <span className="shrink-0 mt-1 text-white/25 text-sm font-medium">{vehicle.year}</span>
        </div>

        {/* Specs badges */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { icon: "⛽", val: vehicle.fuel_type },
            { icon: "⚙️", val: vehicle.transmission },
            { icon: "👤", val: `${vehicle.seating_capacity} Seats` },
            ...(vehicle.luggage_capacity ? [{ icon: "🧳", val: `${vehicle.luggage_capacity} Bags` }] : []),
          ].map((spec) => (
            <span
              key={spec.val}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/55 text-xs"
            >
              <span>{spec.icon}</span> {spec.val}
            </span>
          ))}
        </div>

        {/* Security deposit hint */}
        <div className="flex items-center gap-1.5 text-white/25 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Fully insured · {formatINR(vehicle.security_deposit)} refundable deposit
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-white/[0.08] mt-auto">
          <div>
            <p className="text-white/35 text-xs mb-0.5">From</p>
            <p className="text-white font-black text-2xl leading-none">
              {formatINR(vehicle.daily_rate)}
              <span className="text-white/35 font-normal text-sm"> /day</span>
            </p>
            <p className="text-white/25 text-xs mt-1">{formatINR(vehicle.hourly_rate)}/hr</p>
          </div>
          <Link
            href={`/fleet/${vehicle.id}`}
            id={`book-btn-${vehicle.id}`}
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm font-black hover:shadow-lg hover:shadow-[#c9a84c]/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            Book Now
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
