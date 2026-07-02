import Link from "next/link";

export const metadata = {
  title: "Page Not Found — 3M Car Rentals",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060b18] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#c9a84c]/8 rounded-full blur-[120px] pointer-events-none" />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        {/* 404 Number */}
        <div className="relative">
          <p className="text-[12rem] font-black leading-none text-white/[0.04] select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-white mb-3">Lost on the road?</h1>
          <p className="text-white/50 text-base leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            id="not-found-home-btn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] font-bold text-sm hover:shadow-xl hover:shadow-[#c9a84c]/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            ← Back to Home
          </Link>
          <Link
            href="/fleet"
            id="not-found-fleet-btn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium text-sm transition-all duration-200"
          >
            Browse Our Fleet
          </Link>
        </div>
      </div>
    </div>
  );
}
