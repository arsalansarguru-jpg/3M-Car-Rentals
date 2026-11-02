"use client";

import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, Car, Users, CheckCircle, Shield } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Rented a Thar 4x4 from 3M for 4 days in North Goa. Delivered right to Mopa Airport on time. Smooth car, automatic transmission made traffic easy, and zero hassle handover.",
    author: "Jenny D'Souza",
    role: "Traveler from Mumbai",
  },
  {
    quote:
      "A very reliable initiative in Goa. The prices are transparent with zero hidden fees. Got an Innova Crysta for our family trip, ice cold AC and super clean vehicle.",
    author: "Kundan Jha",
    role: "Marketing Director, Bangalore",
  },
  {
    quote:
      "Just traveled across South Goa with 3M Car Rentals. The cars are clean and new. No need to bargain or worry about surge fares since the rates are fixed and verified.",
    author: "Suman Verma",
    role: "Business Traveler, Delhi",
  },
  {
    quote:
      "3M Car Rentals brings you the simplest way to get a relaxing self-drive car when you arrive in the state of Goa. Outstanding WhatsApp support throughout our stay.",
    author: "Jitender Singh",
    role: "Tourist from Punjab",
  },
];

export default function MajesticTestimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const next = () => {
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-[#171614] via-[#1F1D19] to-[#171614] border-t border-white/5 relative overflow-hidden">
      {/* Background Overlayer */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 max-w-[1300px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Testimonials Slider */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#C9A84C] uppercase">
                TESTIMONIALS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                What Our Clients Say
              </h2>
              <div className="w-16 h-1 bg-[#C9A84C] rounded-full"></div>
            </div>

            <div className="relative p-7 sm:p-8 rounded-2xl bg-[#141310]/90 border border-white/10 shadow-2xl min-h-[220px] flex flex-col justify-between">
              <Quote className="w-8 h-8 text-[#C9A84C]/40 mb-3" />

              <p className="text-xs sm:text-sm text-zinc-200 italic font-light leading-relaxed mb-6">
                &quot;{TESTIMONIALS[current].quote}&quot;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">{TESTIMONIALS[current].author}</h4>
                  <span className="text-xs text-zinc-400">{TESTIMONIALS[current].role}</span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-[#C9A84C] fill-current" />
                  ))}
                </div>
              </div>

              {/* Slider Dots / Controls */}
              <div className="flex items-center justify-between pt-4 mt-2">
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                      className={`h-1.5 transition-all rounded-full ${
                        i === current ? "w-6 bg-[#C9A84C]" : "w-2 bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    aria-label="Previous review"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C9A84C] hover:text-black text-white flex items-center justify-center transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next review"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C9A84C] hover:text-black text-white flex items-center justify-center transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Stat Counters (Exact layout from Majestic Tours) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Stat 1 */}
              <div className="p-6 rounded-2xl bg-[#141310]/90 border border-white/10 text-center space-y-2 group hover:border-[#C9A84C]/50 transition shadow-xl">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#C9A84C] group-hover:scale-105 transition-transform">
                  15<span className="text-white">+</span>
                </div>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Cars For Rent
                </p>
              </div>

              {/* Stat 2 */}
              <div className="p-6 rounded-2xl bg-[#141310]/90 border border-white/10 text-center space-y-2 group hover:border-[#C9A84C]/50 transition shadow-xl">
                <div className="text-4xl sm:text-5xl font-extrabold text-white group-hover:scale-105 transition-transform">
                  10,000<span className="text-[#C9A84C]">+</span>
                </div>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Happy Clients
                </p>
              </div>

              {/* Stat 3 */}
              <div className="p-6 rounded-2xl bg-[#141310]/90 border border-white/10 text-center space-y-2 group hover:border-[#C9A84C]/50 transition shadow-xl">
                <div className="text-4xl sm:text-5xl font-extrabold text-white group-hover:scale-105 transition-transform">
                  5,000<span className="text-[#C9A84C]">+</span>
                </div>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Positive Reviews
                </p>
              </div>

              {/* Stat 4 */}
              <div className="p-6 rounded-2xl bg-[#141310]/90 border border-white/10 text-center space-y-2 group hover:border-[#C9A84C]/50 transition shadow-xl">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#C9A84C] group-hover:scale-105 transition-transform">
                  24/7
                </div>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Local Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
