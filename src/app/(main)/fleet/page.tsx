import { Suspense } from "react";
import Link from "next/link";
import { getAvailableVehicles, getVehicleCategories } from "@/services/fleet.service";
import VehicleCard from "@/components/fleet/VehicleCard";
import type { VehicleCategory } from "@/types/database";

export const metadata = {
  title: "Our Fleet — 3M Car Rentals Goa",
  description:
    "Browse hatchbacks, sedans, SUVs, and luxury cars for self-drive or chauffeur rental in Goa. All inspection-verified, fully insured.",
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function VehicleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-white/10 bg-white/[0.08] backdrop-blur-xl rounded-[20px] overflow-hidden animate-pulse">
          <div className="h-56 bg-white/[0.03]" />
          <div className="p-7 flex flex-col gap-4">
            <div className="h-2.5 w-1/4 bg-white/5" />
            <div className="h-6 w-2/3 bg-white/5" />
            <div className="flex gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-6 w-16 bg-white/[0.03]" />
              ))}
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-white/[0.05]">
              <div className="space-y-2">
                <div className="h-2.5 w-10 bg-white/5" />
                <div className="h-6 w-24 bg-white/5" />
              </div>
              <div className="h-11 w-24 bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Category filter bar ──────────────────────────────────────────────────────
function CategoryFilter({
  categories,
  counts,
  activeSlug,
  total,
}: {
  categories: VehicleCategory[];
  counts: Record<string, number>;
  activeSlug?: string;
  total: number;
}) {
  return (
    <div className="flex flex-nowrap overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-3 mb-12 scrollbar-none">
      <Link
        href="/fleet"
        id="filter-all"
        className={`inline-flex items-center gap-2.5 px-6 py-3 border rounded-[20px] transition-all duration-300 shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.1em] ${
          !activeSlug
            ? "bg-white/[0.12] border-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]"
            : "border-white/10 text-[#E8DCC8]/60 hover:text-white hover:border-white/20 bg-white/[0.04] backdrop-blur-md"
        }`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        All Vehicles
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            !activeSlug ? "bg-white/15 text-white" : "bg-white/5 text-white/40"
          }`}
        >
          {total}
        </span>
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/fleet?category=${cat.slug}`}
          id={`filter-${cat.slug}`}
          className={`inline-flex items-center gap-2.5 px-6 py-3 border rounded-[20px] transition-all duration-300 shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.1em] ${
            activeSlug === cat.slug
              ? "bg-white/[0.12] border-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]"
              : "border-white/10 text-[#E8DCC8]/60 hover:text-white hover:border-white/20 bg-white/[0.04] backdrop-blur-md"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {cat.name}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSlug === cat.slug ? "bg-white/15 text-white" : "bg-white/5 text-white/40"
            }`}
          >
            {counts[cat.slug] ?? 0}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Fleet grid (server component, fetches data) ──────────────────────────────
async function FleetGrid({ categorySlug }: { categorySlug?: string }) {
  const [vehicles, categories] = await Promise.all([
    getAvailableVehicles(),
    getVehicleCategories(),
  ]);

  const counts: Record<string, number> = {};
  for (const v of vehicles) {
    const s = v.category?.slug ?? "";
    counts[s] = (counts[s] ?? 0) + 1;
  }

  const filtered = categorySlug
    ? vehicles.filter((v) => v.category?.slug === categorySlug)
    : vehicles;

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null;

  return (
    <>
      <CategoryFilter
        categories={categories}
        counts={counts}
        activeSlug={categorySlug}
        total={vehicles.length}
      />

      {/* Results header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 border-b border-white/5 pb-4">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            fontWeight: 400,
            color: "rgba(232, 220, 200, 0.4)",
          }}
        >
          Showing{" "}
          <span style={{ fontWeight: 600, color: "#ffffff" }}>{filtered.length}</span>{" "}
          {filtered.length === 1 ? "vehicle" : "vehicles"}
          {activeCategory && (
            <>
              {" "}in{" "}
              <span className="text-[#C9A84C] font-semibold">
                {activeCategory.name}
              </span>
            </>
          )}
        </p>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 400,
            color: "rgba(232, 220, 200, 0.3)",
          }}
        >
          Prices in INR · Inclusive of GST
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[20px]">
          <p className="text-white/40 text-lg font-light">No vehicles available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
interface FleetPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function FleetPage({ searchParams }: FleetPageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;

  return (
    <div className="min-h-screen bg-[#121210]">
      {/* Page Header */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-36 pb-8">
        <div className="flex items-center gap-3.5 mb-4">
          <span className="block w-6 h-px bg-[#C9A84C]/45" />
          <p
            className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Available Now
          </p>
        </div>
        <h1
          className="text-white mb-4"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 300,
          }}
        >
          Our Fleet
        </h1>
        <p
          className="text-[#E8DCC8]/50 max-w-xl font-light"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.0625rem",
          }}
        >
          Inspection-verified, fully insured. Delivered to your door or airport terminal.
        </p>
      </div>

      {/* Fleet Content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pb-36">
        <Suspense fallback={<VehicleGridSkeleton />}>
          <FleetGrid categorySlug={categorySlug} />
        </Suspense>
      </div>
    </div>
  );
}
