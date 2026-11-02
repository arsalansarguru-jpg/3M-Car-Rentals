"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, Phone, User, Clock, CheckCircle2, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

interface Car {
  id: string;
  name: string;
  daily_rate: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  image: string;
  category: string;
}

interface QuickBookingModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (bookingId: string) => void;
}

export default function QuickBookingModal({
  car,
  isOpen,
  onClose,
  onBookingSuccess,
}: QuickBookingModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Mopa Airport (GOX)");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [returnDate, setReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !car) return null;

  // Calculate days & total
  const start = pickupDate ? new Date(pickupDate) : null;
  const end = returnDate ? new Date(returnDate) : null;
  let totalDays = 1;
  if (start && end && end > start) {
    totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
  const totalAmount = totalDays * car.daily_rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !customerPhone.trim() || !pickupDate || !returnDate) {
      setError("Please fill in your name, WhatsApp phone number, and rental dates.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: car.id,
          car_name: car.name,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          pickup_location: pickupLocation,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          return_date: returnDate,
          daily_rate: car.daily_rate,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit booking");
      }

      setBookingId(data.booking.id);
      setWhatsappUrl(data.whatsappUrl);
      setSubmitted(true);
      if (onBookingSuccess) {
        onBookingSuccess(data.booking.id);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try calling us directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#171614] border border-[#C9A84C]/30 rounded-2xl shadow-2xl overflow-hidden text-[#E8DCC8]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121210]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse"></span>
            <h3 className="text-lg font-semibold text-white tracking-wide">
              {submitted ? "Booking Received!" : `Book ${car.name}`}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Confirmation & Instant Owner WhatsApp Trigger Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#C9A84C]/20 border border-[#C9A84C] flex items-center justify-center text-[#C9A84C]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-white">Booking Request Confirmed!</h4>
              <p className="text-sm text-zinc-400">
                Booking Reference: <span className="font-mono text-[#C9A84C] font-semibold">{bookingId}</span>
              </p>
              <p className="text-zinc-300 max-w-md mx-auto text-sm leading-relaxed">
                The 3M Car Rentals owner has been alerted with your booking details. Click below to connect directly with the owner on WhatsApp for fast car dispatch.
              </p>
            </div>

            {/* Booking Summary Box */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-zinc-400">
                <span>Vehicle:</span>
                <span className="text-white font-medium">{car.name}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Pickup:</span>
                <span className="text-white font-medium">{pickupLocation}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Dates:</span>
                <span className="text-white font-medium">
                  {pickupDate} ({pickupTime}) → {returnDate}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 pt-2 border-t border-white/10">
                <span>Estimated Total ({totalDays} Days):</span>
                <span className="text-[#C9A84C] font-bold text-base">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat with Owner on WhatsApp
                </a>
              )}
              <a
                href="tel:+919637901501"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#22211D] hover:bg-[#2C2A25] text-white border border-[#C9A84C]/40 font-semibold flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4 text-[#C9A84C]" />
                Call Owner: +91 9637901501
              </a>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {error && (
              <div className="p-3 text-xs bg-red-950/50 border border-red-500/50 text-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Selected Car Highlight */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#1F1E1B] border border-white/5">
              <img
                src={car.image}
                alt={car.name}
                className="w-20 h-14 object-cover rounded-lg border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm sm:text-base truncate">{car.name}</h4>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                  <span>{car.seats} Seats</span>
                  <span>•</span>
                  <span>{car.transmission}</span>
                  <span>•</span>
                  <span>{car.fuel_type}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Daily Rate</span>
                <span className="text-base font-bold text-[#C9A84C]">₹{car.daily_rate}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Full Name <span className="text-[#C9A84C]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Amit Patil"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  WhatsApp Phone <span className="text-[#C9A84C]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>
            </div>

            {/* Email (Optional) & Pickup Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Pickup & Drop Location <span className="text-[#C9A84C]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C] transition appearance-none"
                  >
                    <option value="Mopa Airport (GOX) - North Goa">Mopa Airport (GOX) - North Goa</option>
                    <option value="Dabolim Airport (GOI) - South Goa">Dabolim Airport (GOI) - South Goa</option>
                    <option value="Candolim / Calangute Delivery">Candolim / Calangute Delivery</option>
                    <option value="Baga / Anjuna / Vagator Hotel">Baga / Anjuna / Vagator Hotel</option>
                    <option value="Panjim City Center">Panjim City Center</option>
                    <option value="Madgaon / Thivim Railway Station">Madgaon / Thivim Railway Station</option>
                    <option value="South Goa Hotels (Colva / Palolem)">South Goa Hotels (Colva / Palolem)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email Address <span className="text-zinc-500">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C] transition"
                />
              </div>
            </div>

            {/* Dates & Pickup Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Pickup Date <span className="text-[#C9A84C]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Pickup Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C] transition appearance-none"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                    <option value="10:00 PM">10:00 PM</option>
                    <option value="Late Night / Midnight">Late Night / Midnight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Return Date <span className="text-[#C9A84C]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C] transition"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Special Requests / Flight Number <span className="text-zinc-500">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Flight 6E-204 arriving at GOX, please bring baby seat"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-[#C9A84C] transition"
              />
            </div>

            {/* Pricing Summary */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#1E1C18] to-[#141310] border border-[#C9A84C]/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Total Rental Duration</span>
                <span className="text-sm font-semibold text-white">
                  {totalDays} {totalDays === 1 ? "Day" : "Days"} @ ₹{car.daily_rate}/day
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Estimated Total</span>
                <span className="text-xl font-bold text-[#C9A84C]">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero cancellation fee • Instant owner confirmation • Clean & sanitized car</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 text-xs sm:text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] shadow-lg shadow-[#C9A84C]/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Confirm Booking Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
