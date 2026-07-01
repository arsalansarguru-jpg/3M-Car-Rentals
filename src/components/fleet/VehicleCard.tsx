import type { VehicleWithCategory } from "@/types/database";
import Link from "next/link";

// Category-based gradient backgrounds — displayed when no vehicle photo exists
const CATEGORY_GRADIENTS: Record<string, string> = {
  hatchback: "from-slate-600 via-slate-700 to-slate-900",
  sedan:     "from-blue-700 via-blue-800 to-[#0a0f1e]",
  suv:       "from-emerald-700 via-emerald-900 to-[#0a0f1e]",
  luxury:    "from-[#8a6a20] via-[#5c4510] to-[#0a0f1e]",
  "premium-suv": "from-purple-700 via-purple-900 to-[#0a0f1e]",
};

// Category-based icon (SVG paths embedded directly — no external dependency)
const CATEGORY_ICONS: Record<string, string> = {
  hatchback: "🚗",
  sedan:     "🚙",
  suv:       "🚐",
  luxury:    "🏎️",
  "premium-suv": "🚘",
};

function formatCurrency(amount: number): string {
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
  const gradient = CATEGORY_GRADIENTS[slug] ?? CATEGORY_GRADIENTS.sedan;
  const icon = CATEGORY_ICONS[slug] ?? "🚗";

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] hover:border-[#c9a84c]/40 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden"
      aria-label={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
    >
      {/* Vehicle image / gradient placeholder */}
      <div
        className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/10">
          {vehicle.category?.name ?? "Vehicle"}
        </span>

        {/* Availability badge */}
        {vehicle.availability_status === "available" && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Available
          </span>
        )}

        {/* Car emoji/icon */}
        <span className="text-6xl select-none drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Vehicle name and year */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                {vehicle.brand}
              </p>
              <h3 className="text-white font-bold text-lg leading-tight mt-0.5">
                {vehicle.model}
                {vehicle.variant && (
                  <span className="text-white/40 font-normal text-sm ml-1.5">
                    {vehicle.variant}
                  </span>
                )}
              </h3>
            </div>
            <span className="shrink-0 text-white/30 text-sm font-medium mt-0.5">
              {vehicle.year}
            </span>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium capitalize">
            ⛽ {vehicle.fuel_type}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium capitalize">
            ⚙️ {vehicle.transmission}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
            👥 {vehicle.seating_capacity} Seats
          </span>
          {vehicle.luggage_capacity && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              🧳 {vehicle.luggage_capacity} Bags
            </span>
          )}
        </div>

        {/* Pricing + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
          <div>
            <p className="text-white/40 text-xs">Starting from</p>
            <p className="text-white font-black text-xl">
              {formatCurrency(vehicle.daily_rate)}
              <span className="text-white/40 font-normal text-sm"> /day</span>
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              {formatCurrency(vehicle.hourly_rate)}/hr
            </p>
          </div>
          <Link
            href={`/fleet/${vehicle.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-[#c9a84c]/25 hover:-translate-y-0.5 transition-all duration-200"
            id={`book-btn-${vehicle.id}`}
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
