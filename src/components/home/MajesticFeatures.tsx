"use client";

import React from "react";
import { Award, ShieldCheck, Sparkles, Clock, CheckCircle2, Phone, MessageSquare } from "lucide-react";

export default function MajesticFeatures() {
  const dotFeatures = [
    {
      title: "Best Price Guarantee",
      desc: "3M Car Rentals provides you the best daily price guarantee across Goa with zero hidden markups.",
    },
    {
      title: "No Cancellation Fees",
      desc: "No charges or penalty on cancellations when informed in advance. Enjoy completely flexible planning.",
    },
    {
      title: "Best Quality Cars",
      desc: "Sanitized, mechanically inspected, and fresh vehicles equipped with high safety standards and ice-cold AC.",
    },
    {
      title: "Reservation Anytime",
      desc: "24/7 anytime reservation option to reserve self-drive cars and airport transfers online and on WhatsApp.",
    },
  ];

  return (
    <>
      {/* 1. Why People Like Us Section (Exact layout from Majestic Tours) */}
      <section className="py-20 bg-[#121210] border-t border-white/5 relative">
        <div className="max-w-[1300px] mx-auto px-6 sm:px-10">
          {/* Section Title with Background Accent */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-16 relative">
            <span className="text-xs font-bold tracking-widest text-[#C9A84C] uppercase">
              RELIABLE & TRUSTED
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why People Like Us?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light">
              3M Car Rentals provides one of the premier self-drive and cab services in Goa.
            </p>
            <div className="w-16 h-1 bg-[#C9A84C] mx-auto mt-2 rounded-full"></div>
          </div>

          {/* 4 Dot Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {dotFeatures.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#181714] border border-white/8 hover:border-[#C9A84C]/40 transition-all duration-300 relative group shadow-lg hover:-translate-y-1"
              >
                {/* Accent Dot */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-[#C9A84C] shadow-sm shadow-[#C9A84C]/50 group-hover:scale-125 transition-transform" />
                  <div className="h-[1px] w-12 bg-gradient-to-r from-[#C9A84C]/40 to-transparent" />
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#C9A84C] transition-colors mb-2">
                  {f.title}
                </h3>

                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. About Us with Image (Exact section from Majestic Tours) */}
      <section className="py-20 bg-[#171614] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1300px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Image */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border-2 border-[#C9A84C]/30 shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80"
                  alt="About 3M Car Rentals Goa"
                  className="w-full h-[380px] sm:h-[440px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="bg-[#121210]/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                    <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">
                      Over 10+ Years of Excellence
                    </p>
                    <p className="text-[11px] text-zinc-300 mt-0.5">
                      Serving happy tourists in Goa with zero hassle rentals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-[#C9A84C] uppercase">
                  ABOUT US
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                  3M Car Rentals Goa
                </h2>
                <div className="w-16 h-1 bg-[#C9A84C] rounded-full"></div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                One of the best airport and train station pickup and drops, North and South Goa tours, verified self-drive cars, and luxury cab services in Goa are all offered by <strong>3M Car Rentals</strong>. We are Goa&apos;s most dependable car rental partner.
              </p>

              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                We guarantee you worry-free and secure car rental experiences in Goa to make your travels within the coastal state joyful. Plan your journey, including your airport transfers from <strong>Mopa International Airport (GOX)</strong> or <strong>Dabolim Airport (GOI)</strong>, with simplicity. For Goa self-drive cars and taxis, use our convenient online and WhatsApp booking services.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span>24/7 Roadside Assistance</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span>Doorstep & Hotel Handover</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span>Zero Security Deposit Hassles</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span>Transparent Upfront Rates</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <a
                  href="tel:+919637901501"
                  className="px-6 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] font-bold text-xs uppercase tracking-wider shadow-lg transition"
                >
                  Call +91 9637901501
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=919637901501&text=Hello%203M%20Car%20Rentals,%20I%20would%20like%20to%20know%20more%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
