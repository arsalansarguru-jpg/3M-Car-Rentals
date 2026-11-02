"use client";

import React, { useState, useEffect } from "react";
import { Star, Phone, MessageSquare, AlertCircle, Sparkles, Check, Users, Gauge, Fuel } from "lucide-react";
import QuickBookingModal from "@/components/booking/QuickBookingModal";

interface Car {
  id: string;
  name: string;
  category: string;
  daily_rate: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  image: string;
  is_displayed?: boolean;
  is_featured?: boolean;
  features?: string[];
}

export default function PublicFleetShowcase() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCarForBooking, setSelectedCarForBooking] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fleet?public=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.cars)) {
        setCars(data.cars);
      }
    } catch (err) {
      console.error("Failed to load fleet:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Popular Cars" },
    { id: "suv", label: "SUVs & 4x4" },
    { id: "hatchback", label: "Hatchbacks" },
    { id: "muv", label: "7-Seater Family" },
    { id: "luxury", label: "Luxury" },
    { id: "sedan", label: "Sedans" },
  ];

  const filteredCars = cars.filter((c) => {
    if (selectedCategory === "all") return true;
    return c.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleOpenBooking = (car: Car) => {
    setSelectedCarForBooking(car);
    setIsModalOpen(true);
  };

  return (
    <section id="fleet" className="py-20 bg-[#161512] border-t border-white/5 relative">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-10">
        {/* Section Title (Exact structure from Majestic Tours) */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold tracking-widest text-[#C9A84C] uppercase">
            POPULAR CARS & CABS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Popular Cars
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-light">
            We have a wide range of popular self-drive cars, cabs & taxis across Goa.
          </p>
          <div className="w-16 h-1 bg-[#C9A84C] mx-auto mt-2 rounded-full"></div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-[#C9A84C] text-[#121210] shadow-md shadow-[#C9A84C]/30 scale-105"
                    : "bg-[#1E1C18] text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl bg-[#1D1B17] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20 bg-[#1D1B17] rounded-2xl border border-white/5 p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-[#C9A84C] mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white">No Vehicles Found</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Please choose another category or contact us on WhatsApp directly.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 px-5 py-2 text-xs rounded-xl bg-[#C9A84C] text-black font-semibold"
            >
              Show All Cars
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => {
              const whatsappEnquiryText = encodeURIComponent(
                `Hello 3M Car Rentals, I would like to inquire about booking the *${car.name}* (Starts at ₹${car.daily_rate}/day). Could you please let me know availability? Thank you!`
              );
              const whatsappLink = `https://api.whatsapp.com/send?phone=919637901501&text=${whatsappEnquiryText}`;

              return (
                <div
                  key={car.id}
                  className="rounded-2xl bg-[#1D1B17] border border-white/8 hover:border-[#C9A84C]/50 transition-all duration-300 flex flex-col overflow-hidden group shadow-xl hover:-translate-y-1"
                >
                  {/* Car Image + 5.0 Star Badge (Exact Majestic Tours Style) */}
                  <div className="relative h-56 w-full overflow-hidden bg-black/40">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Majestic Style Star Review Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1 border border-white/10 shadow">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>5.0</span>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#C9A84C]/90 text-[#121210] text-[10px] font-extrabold uppercase tracking-wider shadow">
                      {car.category}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1D1B17] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Car Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#C9A84C] transition-colors leading-snug mb-3">
                        {car.name}
                      </h3>

                      {/* Specs Row: Seats • Fuel • Transmission */}
                      <div className="py-2.5 px-3 rounded-xl bg-[#121210] border border-white/5 flex items-center justify-between text-xs text-zinc-300 mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
                          {car.seats} Seats
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-[#C9A84C]" />
                          {car.fuel_type}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-[#C9A84C]" />
                          {car.transmission}
                        </span>
                      </div>

                      {/* Price Display */}
                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-[11px] text-zinc-500 block">Daily Starting Rate</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-[#C9A84C]">
                              ₹{car.daily_rate.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-zinc-400">/ Day</span>
                          </div>
                        </div>

                        {/* Call Now Badge Stamp */}
                        <a
                          href="tel:+919637901501"
                          className="px-3 py-1.5 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black font-extrabold text-[11px] uppercase transition flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Now</span>
                        </a>
                      </div>
                    </div>

                    {/* Booking Buttons */}
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleOpenBooking(car)}
                        className="w-full py-3 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#C9A84C]/15 transition active:scale-[0.98]"
                      >
                        Book Your Ride Now
                      </button>

                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Instant WhatsApp Enquiry</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <QuickBookingModal
        car={selectedCarForBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
