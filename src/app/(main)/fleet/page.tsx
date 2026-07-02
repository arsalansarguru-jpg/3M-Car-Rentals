import { Suspense } from "react";
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden animate-pulse">
          <div className="h-52 bg-white/[0.05]" />
          <div className="p-5 flex flex-col gap-3">
            <div className="h-2.5 w-1/4 rounded-full bg-white/10" />
            <div className="h-5 w-2/3 rounded-full bg-white/10" />
            <div className="flex gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-6 w-16 rounded-lg bg-white/[0.05]" />
              ))}
            </div>
            <div className="flex justify-between items-end pt-3 border-t border-white/[0.06]">
              <div className="space-y-1.5">
                <div className="h-2 w-10 rounded-full bg-white/10" />
                <div className="h-6 w-24 rounded-full bg-white/10" />
              </div>
              <div className="h-10 w-24 rounded-xl bg-white/10" />
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
    <div className="flex flex-wrap gap-2 mb-10">
      <a
        href="/fleet"
        id="filter-all"
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          !activeSlug
            ? "bg-[#c9a84c] text-[#0a0f1e] shadow-lg shadow-[#c9a84c]/20"
            : "border border-white/15 text-white/60 hover:text-white hover:border-white/30 bg-white/[0.03]"
        }`}
      >
        All Vehicles
        <span className={`text-xs px-2 py-0.5 rounded-full ${!activeSlug ? "bg-[#0a0f1e]/20" : "bg-white/10"}`}>
          {total}
        </span>
      </a>
      {categories.map((cat) => (
        <a
          key={cat.id}
          href={`/fleet?category=${cat.slug}`}
          id={`filter-${cat.slug}`}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeSlug === cat.slug
              ? "bg-[#c9a84c] text-[#0a0f1e] shadow-lg shadow-[#c9a84c]/20"
              : "border border-white/15 text-white/60 hover:text-white hover:border-white/30 bg-white/[0.03]"
          }`}
        >
          {cat.name}
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeSlug === cat.slug ? "bg-[#0a0f1e]/20" : "bg-white/10"}`}>
            {counts[cat.slug] ?? 0}
          </span>
        </a>
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
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">
          Showing{" "}
          <span className="text-white font-semibold">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "vehicle" : "vehicles"}
          {activeCategory && (
            <> in <span className="text-[#c9a84c]">{activeCategory.name}</span></>
          )}
        </p>
        <p className="text-white/25 text-xs">Prices in INR · inclusive of GST</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <svg className="w-9 h-9 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white/50 text-lg font-semibold">No vehicles available</p>
          <p className="text-white/30 text-sm max-w-xs">There are no vehicles in this category right now. Try a different filter or check back later.</p>
          <a
            href="/fleet"
            className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-medium hover:bg-white/10 transition-colors duration-200"
          >
            ← View all vehicles
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface FleetPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function FleetPage({ searchParams }: FleetPageProps) {
  const { category } = await searchParams;

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Page header */}
      <div className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden bg-[#060b18]">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Available Now</p>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Our Fleet</h1>
              <p className="text-white/40 text-base max-w-md leading-relaxed">
                Inspection-verified, fully insured. Delivered to your door or airport.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all duration-200"
                id="fleet-call-btn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Need help choosing?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <Suspense fallback={<VehicleGridSkeleton />}>
          <FleetGrid categorySlug={category} />
        </Suspense>
      </div>
    </div>
  );
}
