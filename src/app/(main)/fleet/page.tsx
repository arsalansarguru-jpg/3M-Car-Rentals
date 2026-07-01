import { Suspense } from "react";
import { getAvailableVehicles, getVehicleCategories } from "@/services/fleet.service";
import VehicleCard from "@/components/fleet/VehicleCard";

export const metadata = {
  title: "Our Fleet — 3M Car Rentals Goa",
  description:
    "Browse our curated fleet of hatchbacks, sedans, SUVs, and luxury cars for self-drive or chauffeur rental in Goa. All vehicles are fully insured and inspection-verified.",
};

// Skeleton loader shown while vehicles are fetching
function VehicleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-white/5" />
          <div className="p-5 flex flex-col gap-3">
            <div className="h-3 w-1/3 rounded bg-white/10" />
            <div className="h-5 w-2/3 rounded bg-white/10" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-lg bg-white/5" />
              <div className="h-6 w-20 rounded-lg bg-white/5" />
              <div className="h-6 w-16 rounded-lg bg-white/5" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <div className="h-7 w-24 rounded bg-white/10" />
              <div className="h-9 w-24 rounded-lg bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function FleetGrid({ categorySlug }: { categorySlug?: string }) {
  const [vehicles, categories] = await Promise.all([
    getAvailableVehicles(),
    getVehicleCategories(),
  ]);

  const filtered = categorySlug
    ? vehicles.filter((v) => v.category?.slug === categorySlug)
    : vehicles;

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        <a
          href="/fleet"
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
            !categorySlug
              ? "bg-[#c9a84c] text-[#0a0f1e] border-[#c9a84c] font-bold"
              : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
          }`}
          id="filter-all"
        >
          All ({vehicles.length})
        </a>
        {categories.map((cat) => {
          const count = vehicles.filter((v) => v.category?.slug === cat.slug).length;
          return (
            <a
              key={cat.id}
              href={`/fleet?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                categorySlug === cat.slug
                  ? "bg-[#c9a84c] text-[#0a0f1e] border-[#c9a84c] font-bold"
                  : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
              }`}
              id={`filter-${cat.slug}`}
            >
              {cat.name} ({count})
            </a>
          );
        })}
      </div>

      {/* Vehicle grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <span className="text-6xl">🚗</span>
          <p className="text-white/50 mt-4 text-lg">
            No vehicles available in this category right now.
          </p>
          <a href="/fleet" className="text-[#c9a84c] hover:text-white text-sm font-medium mt-2 inline-block transition-colors duration-200">
            View all vehicles →
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

interface FleetPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function FleetPage({ searchParams }: FleetPageProps) {
  const { category } = await searchParams;

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Page header */}
      <div className="relative pt-32 pb-16 px-4 sm:px-6 text-center overflow-hidden bg-gradient-to-b from-[#060b18] to-[#0a0f1e]">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Curated for Goa
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Our Fleet
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Every vehicle is inspection-verified, fully insured, and available for
            instant self-drive booking or chauffeur-driven rental.
          </p>
        </div>
      </div>

      {/* Fleet grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <Suspense fallback={<VehicleGridSkeleton />}>
          <FleetGrid categorySlug={category} />
        </Suspense>
      </div>
    </div>
  );
}
