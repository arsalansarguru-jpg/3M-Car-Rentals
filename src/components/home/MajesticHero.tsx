"use client";

import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, ChevronLeft, ChevronRight, Calendar, MapPin, User, Car, Sparkles, Send } from "lucide-react";
import QuickBookingModal from "@/components/booking/QuickBookingModal";

const SLIDES = [
  {
    id: 1,
    title: "Drive the Scenic Freedom of Goa",
    subtitle: "Cruise iconic palm-lined Goan avenues and scenic coastal roads with 3M Car Rentals premier self-drive fleet.",
    cta: "Contact Now",
    image: "/images/hero/goa_parra_palm_road.jpg",
  },
  {
    id: 2,
    title: "Arabian Sea Sunset Coastal Drives",
    subtitle: "Enjoy worry-free, sanitized self-drive cars along ocean highways for an unforgettable tropical Goa holiday.",
    cta: "Explore Fleet",
    image: "/images/hero/goa_coastal_road_sunset.jpg",
  },
  {
    id: 3,
    title: "Panoramic Beach & Cliff Overlooks",
    subtitle: "Explore Vagator, Anjuna, and South Goa coastlines with 2-minute airport handover at Mopa (GOX) & Dabolim (GOI).",
    cta: "Book Now",
    image: "/images/hero/goa_cliff_overlook_sunset.jpg",
  },
  {
    id: 4,
    title: "Tropical Goa Beach Vacations",
    subtitle: "Top-condition hatchbacks, sedans, 7-seaters, and 4x4 Thar convertibles delivered right to your hotel or airport.",
    cta: "Book Your Ride",
    image: "/images/hero/goa_tropical_beach_sunset.jpg",
  },
];

export default function MajesticHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cars, setCars] = useState<any[]>([]);

  // Search form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Mopa Airport (GOX)");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCarForModal, setSelectedCarForModal] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/fleet?public=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.cars)) {
          setCars(data.cars);
          if (data.cars.length > 0) {
            setSelectedCarId(data.cars[0].id);
          }
        }
      })
      .catch((err) => console.error("Error loading cars for search form:", err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const carObj = cars.find((c) => c.id === selectedCarId) || cars[0] || {
      id: "car-general",
      name: "3M Verified Rental Car",
      daily_rate: 2500,
      seats: 5,
      transmission: "Automatic",
      fuel_type: "Petrol",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
      category: "suv",
    };

    setSelectedCarForModal(carObj);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="relative bg-[#0F0E0C]">
      {/* Top Slider Carousel */}
      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px] overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Overlayer */}
            <div className="absolute inset-0 bg-black/60 via-black/40 to-black/80" />

            {/* Caption */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto z-20">
              <span className="text-[#C9A84C] text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 px-3 py-1 bg-black/50 border border-[#C9A84C]/40 rounded-full">
                Goa&apos;s Best Self Drive Car Rental
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
                {slide.title}
              </h1>

              <p className="text-sm sm:text-lg text-zinc-200 max-w-2xl mx-auto font-light leading-relaxed mb-8 drop-shadow">
                {slide.subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#book-now"
                  className="px-7 py-3.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#C9A84C]/30 transition transform hover:-translate-y-0.5"
                >
                  Book Your Ride Now
                </a>
                <a
                  href="tel:+919637901501"
                  className="px-6 py-3.5 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/20 font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 backdrop-blur-sm transition"
                >
                  <Phone className="w-4 h-4 text-[#C9A84C]" />
                  Call: +91 9637901501
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#C9A84C] hover:text-black text-white flex items-center justify-center border border-white/20 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-[#C9A84C] hover:text-black text-white flex items-center justify-center border border-white/20 transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 transition-all rounded-full ${
                i === currentSlide ? "w-8 bg-[#C9A84C]" : "w-2 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* "Book Your Ride Now" - Big Search Form (Exact Section from Majestic Tours) */}
      <section id="book-now" className="relative z-30 -mt-10 sm:-mt-14 max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="rounded-2xl bg-[#1A1916] border-2 border-[#C9A84C]/40 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Section Header */}
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold tracking-widest text-[#C9A84C] uppercase block mb-1">
              FASTEST GOA CAR RENTAL DISPATCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Book Your Ride Now
            </h2>
            <div className="w-16 h-1 bg-[#C9A84C] mx-auto mt-2 rounded-full"></div>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#C9A84C]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121210] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  WhatsApp Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#C9A84C]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 Phone Number"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121210] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>

              {/* Pickup Location */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Pickup Location in Goa
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#C9A84C]" />
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121210] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C] transition appearance-none"
                  >
                    <option value="Mopa Airport (GOX)">Mopa Airport (GOX)</option>
                    <option value="Dabolim Airport (GOI)">Dabolim Airport (GOI)</option>
                    <option value="Candolim / Calangute Hotel">Candolim / Calangute Hotel</option>
                    <option value="Baga / Anjuna Beach Area">Baga / Anjuna Beach Area</option>
                    <option value="Panjim City Center">Panjim City Center</option>
                    <option value="Madgaon / Thivim Railway Station">Madgaon / Thivim Railway Station</option>
                    <option value="South Goa Hotels (Colva / Palolem)">South Goa Hotels (Colva / Palolem)</option>
                  </select>
                </div>
              </div>

              {/* Choose Vehicle */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Select Vehicle
                </label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-3 w-4 h-4 text-[#C9A84C]" />
                  <select
                    value={selectedCarId}
                    onChange={(e) => setSelectedCarId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121210] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C] transition appearance-none"
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — ₹{c.daily_rate}/day ({c.transmission})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pickup Date */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Pickup Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-[#C9A84C]" />
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121210] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>

              {/* Return Date */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Return Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-[#C9A84C]" />
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121210] border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>
            </div>

            {/* Form Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                className="px-10 py-3.5 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#C9A84C]/30 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Reserve Ride Now</span>
              </button>
            </div>
          </form>
        </div>

        {/* Decorative Wave Divider Shape (Similar to Majestic's SVG curve) */}
        <div className="w-full flex justify-center -mt-1 opacity-20 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 60" preserveAspectRatio="none" className="w-full h-8 text-[#C9A84C] fill-current">
            <path d="M500.2,50L0,0v60h1000V0L500.2,50z"/>
          </svg>
        </div>
      </section>

      {/* Booking Modal */}
      <QuickBookingModal
        car={selectedCarForModal}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
