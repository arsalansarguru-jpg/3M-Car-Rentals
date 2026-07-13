"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function Hero() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate opacity based on scroll (fully faded at 500px scroll)
  const opacity = Math.max(0, 1 - scrollY / 500);
  const translateY = scrollY * 0.15; // Subtle parallax slide

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#121210]">
      {/* ── Cinematic Background Video ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controls={false}
        className="absolute inset-0 w-full h-full object-cover object-[center_center] md:object-center lg:object-[right_center] pointer-events-none transform gpu opacity-55 z-0"
      >
        <source src="/videos/hero-goa.mp4" type="video/mp4" />
        <source src="/videos/hero-goa.webm" type="video/webm" />
      </video>

      {/* ── Dark Overlay (subtle black gradient) ── */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.60) 100%)"
        }}
      />

      {/* ── Content Wrapper (Scroll Fading & Parallax) ── */}
      <div 
        className="absolute inset-0 z-20 flex flex-col justify-center pt-24 pb-20 transition-opacity duration-75"
        style={{ 
          opacity,
          transform: `translateY(${translateY}px)`
        }}
      >
        <div className="w-full px-6 sm:px-10 lg:px-20">
          <div className="w-full lg:max-w-[36%] md:max-w-[50%] flex flex-col items-start text-left select-none">

            {/* Overline — delicate gold */}
            <div className="flex items-center gap-4 mb-8">
              <span className="block w-8 h-px bg-[#C9A84C]/45" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                }}
              >
                Goa
              </span>
              <span className="block w-8 h-px bg-[#C9A84C]/45" />
            </div>

            {/* Headline — editorial serif */}
            <h1
              className="text-white mb-6"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(3rem, 5.5vw, 5.25rem)",
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: "0.02em",
              }}
            >
              Drive Goa.<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #E8DCC8, #C9A84C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                The 3M Way.
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="mb-10 text-[#E8DCC8]/75 font-light"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.25rem",
                lineHeight: 1.7,
                letterSpacing: "0.01em",
              }}
            >
              Luxury self-drive experiences delivered anywhere in Goa.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10 w-full">
              <Button
                variant="primary"
                onClick={() => router.push("/fleet")}
                className="flex-1 sm:flex-none py-4 px-8 rounded-[20px]"
                id="hero-browse-fleet-btn"
              >
                Book Your Journey
                <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/fleet")}
                className="flex-1 sm:flex-none py-4 px-8 rounded-[20px]"
                id="hero-explore-fleet-btn"
              >
                Explore Fleet
              </Button>
            </div>

            {/* Floating Booking Panel — premium Glassmorphism */}
            <div
              className="w-full p-6 select-text rounded-[20px] bg-white/[0.08] backdrop-blur-[24px] border border-white/12 shadow-[0_15px_35px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Pickup Location & Date */}
                <div className="flex flex-col col-span-2 sm:col-span-1 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 pr-0 sm:pr-4">
                  <label 
                    className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Pickup
                  </label>
                  <select 
                    className="bg-transparent text-white text-sm font-light focus:outline-none cursor-pointer [color-scheme:dark] mb-2"
                    style={{ fontFamily: "var(--font-body)", letterSpacing: "0.02em" }}
                  >
                    <option value="mopa" className="bg-[#121210]">Mopa Airport (GOX)</option>
                    <option value="dabolim" className="bg-[#121210]">Dabolim Airport (GOI)</option>
                    <option value="panaji" className="bg-[#121210]">Panaji Center</option>
                    <option value="candolim" className="bg-[#121210]">Candolim / Calangute</option>
                  </select>
                  <input 
                    type="date" 
                    defaultValue="2026-07-11" 
                    className="bg-transparent text-white/50 text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
                    style={{ fontFamily: "var(--font-body)", letterSpacing: "0.03em" }}
                  />
                </div>

                {/* Return Location & Date */}
                <div className="flex flex-col col-span-2 sm:col-span-1 pl-0 sm:pl-4">
                  <label 
                    className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    Return
                  </label>
                  <select 
                    className="bg-transparent text-white text-sm font-light focus:outline-none cursor-pointer [color-scheme:dark] mb-2"
                    style={{ fontFamily: "var(--font-body)", letterSpacing: "0.02em" }}
                  >
                    <option value="mopa" className="bg-[#121210]">Mopa Airport (GOX)</option>
                    <option value="dabolim" className="bg-[#121210]">Dabolim Airport (GOI)</option>
                    <option value="panaji" className="bg-[#121210]">Panaji Center</option>
                    <option value="candolim" className="bg-[#121210]">Candolim / Calangute</option>
                  </select>
                  <input 
                    type="date" 
                    defaultValue="2026-07-14" 
                    className="bg-transparent text-white/50 text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
                    style={{ fontFamily: "var(--font-body)", letterSpacing: "0.03em" }}
                  />
                </div>
              </div>

              {/* Vehicle selector */}
              <div className="flex flex-col border-t border-white/10 pt-4 mt-4">
                <label 
                  className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Vehicle Category
                </label>
                <select 
                  className="bg-transparent text-white text-sm font-light focus:outline-none cursor-pointer [color-scheme:dark]"
                  style={{ fontFamily: "var(--font-body)", letterSpacing: "0.02em" }}
                >
                  <option value="all" className="bg-[#121210]">All Categories</option>
                  <option value="suv" className="bg-[#121210]">Luxury SUVs</option>
                  <option value="sedan" className="bg-[#121210]">Premium Sedans</option>
                  <option value="convertible" className="bg-[#121210]">Convertibles</option>
                </select>
              </div>

              {/* Find Cars Button */}
              <Button
                variant="primary"
                onClick={() => router.push("/fleet")}
                className="w-full py-4 mt-5 rounded-[20px]"
              >
                Find Cars
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-opacity duration-300"
        style={{ opacity: Math.max(0, 1 - scrollY / 150) }}
      >
        <span className="text-[#C9A84C] text-[9px] uppercase tracking-[0.2em] font-semibold">Scroll</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-[#C9A84C]/50 to-transparent" />
      </div>
    </section>
  );
}
