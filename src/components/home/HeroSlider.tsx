"use client";

import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Plane, Clock, Award } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "Welcome to 3M Car Rentals",
    subtitle: "GOA'S PREMIER SELF-DRIVE EXPERIENCE",
    highlight: "Drive the Freedom of Goa",
    description: "Explore beaches, forts, and palm-lined avenues in top-condition 4x4s, SUVs, and hatchbacks. Transparent pricing with zero hidden fees.",
    image: "/images/hero/goa_parra_palm_road.jpg",
    badge: "Unlimited Kilometers • 100% Insured",
  },
  {
    id: 2,
    title: "Airport Car Delivery in Goa",
    subtitle: "MOPA (GOX) & DABOLIM (GOI)",
    highlight: "Touch Down & Drive Away",
    description: "Your car awaits right at the arrivals terminal. No waiting for taxis, zero surge pricing, and effortless 2-minute handover.",
    image: "/images/hero/goa_coastal_road_sunset.jpg",
    badge: "24/7 Airport Handover Guarantee",
  },
  {
    id: 3,
    title: "Adventure Ready 4x4 & SUVs",
    subtitle: "THAR, CRETA, FORTUNER & CRYSTAS",
    highlight: "Experience Goa in High Gear",
    description: "Whether cruising Candolim beach strip or cruising the coastal cliffs to Vagator, drive with unmatched road presence.",
    image: "/images/hero/goa_cliff_overlook_sunset.jpg",
    badge: "Sanitized & Verified Fleet",
  },
  {
    id: 4,
    title: "Golden Hour Coastlines & Beaches",
    subtitle: "NORTH & SOUTH GOA TOURS",
    highlight: "Explore Every Hidden Beach",
    description: "Discover Palolem, Morjim, and secluded tropical coves at your own relaxed pace with 24/7 roadside assistance.",
    image: "/images/hero/goa_tropical_beach_sunset.jpg",
    badge: "24/7 Roadside Assistance",
  },
];

export default function HeroSlider({ onOpenBooking }: { onOpenBooking?: () => void }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const slide = SLIDES[current];

  return (
    <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0F0E0C]">
      {/* Background Slides */}
      {SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ transition: "opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1), transform 6000ms ease-out" }}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
          />
          {/* Gradients to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121210] via-transparent to-black/60" />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 sm:px-10 py-24 sm:py-32 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-medium tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.badge}</span>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#E8DCC8]/70 uppercase">
            {slide.subtitle}
          </p>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15]">
            {slide.title} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] via-[#E8DCC8] to-[#C9A84C]">
              {slide.highlight}
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed max-w-2xl">
            {slide.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#fleet"
              className="px-8 py-4 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] font-bold text-sm tracking-wider uppercase shadow-xl shadow-[#C9A84C]/25 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Our Fleet
            </a>

            <a
              href="tel:+919637901501"
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm flex items-center gap-3 backdrop-blur-md transition hover:scale-[1.02]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              <Phone className="w-4 h-4 text-[#C9A84C]" />
              <span>Call: +91 9637901501</span>
            </a>

            <a
              href="https://api.whatsapp.com/send?phone=919637901501&text=Hello%203M%20Car%20Rentals,%20I%20am%20looking%20for%20a%20car%20in%20Goa."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 transition hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Instant WhatsApp</span>
            </a>
          </div>

          {/* Value Props Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-xl">
            <div className="flex items-center gap-2.5 text-xs text-zinc-300">
              <Plane className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>Mopa & Dabolim Airport Delivery</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-300">
              <Clock className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>24/7 Roadside Assistance</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-300 col-span-2 sm:col-span-1">
              <ShieldCheck className="w-4 h-4 text-[#C9A84C] shrink-0" />
              <span>Zero Hidden Charges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm transition hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm transition hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-8 h-2 bg-[#C9A84C]" : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
