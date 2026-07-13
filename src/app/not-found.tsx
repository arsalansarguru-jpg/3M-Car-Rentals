import Link from "next/link";

export const metadata = {
  title: "Page Not Found — 3M Car Rentals",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg">
        {/* Sad face in a vertical pill badge */}
        <div className="w-14 h-24 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mb-8 shadow-lg shadow-[#3B82F6]/5">
          <svg className="w-8 h-8 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Text content */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Lost on the road?
        </h1>
        <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            id="not-found-home-btn"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-[#0f1115] font-bold text-sm hover:shadow-xl hover:shadow-[#3B82F6]/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            ← Back to Home
          </Link>
          <Link
            href="/fleet"
            id="not-found-fleet-btn"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 font-semibold text-sm transition-all duration-200"
          >
            Browse Our Fleet
          </Link>
        </div>
      </div>
    </div>
  );
}
