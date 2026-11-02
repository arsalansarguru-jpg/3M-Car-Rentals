"use client";

import React from "react";
import { Phone, ArrowRight, Plane, Train, MapPin, Compass, Car, Navigation } from "lucide-react";

export default function MajesticServices() {
  const services = [
    {
      title: "Airport Pickup & Drop",
      desc: "Hassle-free meet & greet airport delivery at Mopa International (GOX) and Dabolim Airport (GOI). 2-minute handover directly outside arrival gates.",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      tag: "Airport Handover",
    },
    {
      title: "Railway Station Pickup & Drop",
      desc: "Fast self-drive vehicle delivery and taxi pickups at Madgaon (MAO), Thivim (THVM), and Karmali stations across Goa.",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      tag: "Station Delivery",
    },
    {
      title: "North Goa Tour",
      desc: "Explore famous North Goa highlights including Fort Aguada, Chapora Fort, Candolim, Calangute, Baga, and vibrant beach shacks at your own pace.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      tag: "Sightseeing",
    },
    {
      title: "South Goa Tour",
      desc: "Visit heritage Old Goa churches (Basilica of Bom Jesus), peaceful white sand beaches of Colva, Benaulim, Palolem, and spice plantations.",
      image: "https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=800&q=80",
      tag: "Heritage & Nature",
    },
    {
      title: "Self-Drive Car Rental",
      desc: "Freedom to drive Goa your way with verified Thar 4x4, Creta, Swift, Baleno, and Innova Crystas with zero security deposit hassle.",
      image: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=800&q=80",
      tag: "Self Drive",
    },
    {
      title: "Outstation Cab & Trips",
      desc: "Comfortable interstate journeys and day excursions to Dudhsagar Waterfalls, Gokarna, Dandeli, and Belgaum with professional assistance.",
      image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
      tag: "Outstation",
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#121210] border-t border-white/5">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-10">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
          <span className="text-xs font-bold tracking-widest text-[#C9A84C] uppercase">
            COMPREHENSIVE SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our Popular Services
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-light">
            3M Car Rentals provides one of the best taxi and self-drive car services in Goa.
          </p>
          <div className="w-16 h-1 bg-[#C9A84C] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Services Grid (Exact Card Layout with the Stamp Date style from Majestic Tours) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#181714] border border-white/8 hover:border-[#C9A84C]/40 transition-all duration-300 overflow-hidden flex flex-col group shadow-xl hover:-translate-y-1"
            >
              {/* Thumbnail with Call Stamp */}
              <div className="relative h-52 overflow-hidden bg-black/40">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Majestic Style "Call Now" Badge Stamp */}
                <a
                  href="tel:+919637901501"
                  className="absolute bottom-3 left-4 bg-[#C9A84C] text-[#121210] px-3 py-1.5 rounded-lg text-center font-extrabold uppercase shadow-lg hover:bg-[#D4B55E] transition"
                >
                  <span className="block text-[10px] leading-tight font-medium">CALL</span>
                  <span className="block text-xs font-black leading-tight">NOW</span>
                </a>

                {/* Category tag */}
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-white uppercase tracking-wider border border-white/10">
                  {item.tag}
                </span>
              </div>

              {/* Service Meta & Description */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] text-zinc-400 font-medium block">
                    By <span className="text-[#C9A84C] font-semibold">3M Car Rentals</span>
                  </span>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#C9A84C] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <a
                    href="tel:+919637901501"
                    className="text-xs font-semibold text-[#C9A84C] hover:text-[#D4B55E] flex items-center gap-1.5 transition"
                  >
                    <span>Reserve Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://api.whatsapp.com/send?phone=919637901501&text=Hello%203M%20Car%20Rentals,%20I%20would%20like%20to%20inquire%20about%20your%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
