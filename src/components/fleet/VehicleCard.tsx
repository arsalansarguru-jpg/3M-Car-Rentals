import type { VehicleWithCategory } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// ─── Category-specific SVG car silhouettes ───────────────────────────────────
function CarSilhouette({ slug }: { slug: string }) {
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
    default: // sedan
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

// ─── Category visual config ───────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { gradient: string; accent: string; label: string }> = {
  hatchback:    { gradient: "from-[#1A1916] via-[#1E1D1A] to-[#121210]",    accent: "#94a3b8", label: "City Car" },
  sedan:        { gradient: "from-[#1A1916] via-[#1C1B18] to-[#121210]",    accent: "#D4B96A", label: "Saloon" },
  suv:          { gradient: "from-[#1A1916] via-[#1D1C19] to-[#121210]",    accent: "#6ee7b7", label: "Family SUV" },
  luxury:       { gradient: "from-[#1E1B14] via-[#1A1710] to-[#121210]",    accent: "#C9A84C", label: "Luxury" },
  "premium-suv":{ gradient: "from-[#1A1916] via-[#1D1B18] to-[#121210]",    accent: "#C9A84C", label: "Premium" },
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
      className="group flex flex-col bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-blue-500/35 hover:shadow-[0_15px_35px_-8px_rgba(0,0,0,0.6),0_0_20px_rgba(59,130,246,0.15)]"
      aria-label={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
    >
      {/* ── Visual header ── */}
      <div className="relative h-56 overflow-hidden bg-black/25 border-b border-white/5">
        {((vehicle as any).featured_image || ((vehicle as any).images && (vehicle as any).images[0])) ? (
          <img 
            src={(vehicle as any).featured_image || (vehicle as any).images[0]} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            alt={`${vehicle.brand} ${vehicle.model}`} 
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center relative`}>
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: config.accent }}
            />
            <div className="absolute bottom-12 left-8 right-8 h-px bg-white/5" />
            <div className="absolute inset-x-6 bottom-8 top-8">
              <CarSilhouette slug={slug} />
            </div>
          </div>
        )}
        {/* Category label */}
        <span
          className="absolute top-4 left-4 px-3 py-1.5 text-[9px] font-semibold border backdrop-blur-sm z-10 rounded-[20px]"
          style={{
            color: config.accent,
            borderColor: `${config.accent}20`,
            backgroundColor: `${config.accent}0F`,
            fontFamily: "var(--font-body)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {config.label}
        </span>
        {/* Availability badge */}
        {vehicle.availability_status === "available" && (
          <span
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-[20px] backdrop-blur-sm z-10 uppercase tracking-wider"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-7 gap-5">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className="text-[#E8DCC8]/40 text-[10px] font-semibold tracking-[0.16em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {vehicle.brand}
            </p>
            <h3
              className="text-white leading-tight mt-1.5"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                fontWeight: 400,
              }}
            >
              {vehicle.model}
              {vehicle.variant && (
                <span
                  className="font-light text-[#E8DCC8]/30 ml-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                  }}
                >
                  {vehicle.variant}
                </span>
              )}
            </h3>
          </div>
          <span
            className="text-[#E8DCC8]/25 text-xs mt-1.5 font-light"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {vehicle.year}
          </span>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "⛽", val: vehicle.fuel_type },
            { icon: "⚙️", val: vehicle.transmission },
            { icon: "👤", val: `${vehicle.seating_capacity} Seats` },
            ...(vehicle.luggage_capacity ? [{ icon: "🧳", val: `${vehicle.luggage_capacity} Bags` }] : []),
          ].map((spec) => (
            <span
              key={spec.val}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/5 rounded-[20px] text-[#E8DCC8]/60 text-xs font-light"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span>{spec.icon}</span> {spec.val}
            </span>
          ))}
        </div>

        {/* Security deposit */}
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 shrink-0 text-[#C9A84C]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span
            className="text-[#E8DCC8]/30 text-xs font-light"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Fully insured · {formatINR(vehicle.security_deposit)} deposit
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-5 border-t border-white/5 mt-auto">
          <div>
            <p
              className="text-[#E8DCC8]/30 text-[10px] font-semibold tracking-[0.08em] uppercase mb-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              From
            </p>
            <p
              className="text-white leading-none"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                fontWeight: 400,
              }}
            >
              {formatINR(vehicle.daily_rate)}
              <span
                className="font-light text-[#E8DCC8]/30 text-sm ml-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                /day
              </span>
            </p>
          </div>
          <Link href={`/fleet/${vehicle.id}`} id={`book-btn-${vehicle.id}`}>
            <Button
              variant="primary"
              size="sm"
              className="rounded-[20px]"
            >
              Reserve
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
