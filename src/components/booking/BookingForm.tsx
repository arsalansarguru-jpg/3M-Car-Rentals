"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { VehicleWithCategory } from "@/types/database";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return (
    "3M-" +
    Array.from({ length: 8 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("")
  );
}

const LOCATIONS = [
  "Goa International Airport (GOI) — Dabolim",
  "Manohar International Airport (GOX) — Mopa",
  "Panjim City Centre",
  "Calangute Beach Area",
  "Baga / Candolim",
  "Anjuna / Vagator",
  "Margao City",
  "Mapusa Town",
  "Vasco da Gama",
  "Your Hotel / Villa (specify in notes)",
];

interface BookingFormProps {
  vehicle: VehicleWithCategory;
}

export default function BookingForm({ vehicle }: BookingFormProps) {
  const router = useRouter();

  const [pickup, setPickup] = React.useState("");
  const [dropoff, setDropoff] = React.useState("");
  const [pickupDate, setPickupDate] = React.useState("");
  const [returnDate, setReturnDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // ── Live price calculation ──
  const pricingBreakdown = React.useMemo(() => {
    if (!pickupDate || !returnDate) return null;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return null;

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);

    const baseAmount =
      diffDays >= 1
        ? diffDays * vehicle.daily_rate
        : Math.ceil(diffHours) * vehicle.hourly_rate;

    const taxRate = 0.18;
    const taxAmount = +(baseAmount * taxRate).toFixed(2);
    const totalAmount = +(baseAmount + taxAmount).toFixed(2);

    return { diffDays, diffHours, baseAmount, taxAmount, totalAmount };
  }, [pickupDate, returnDate, vehicle]);

  const today = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickup || !dropoff || !pickupDate || !returnDate) {
      setError("Please fill in all required fields.");
      return;
    }
    if (new Date(returnDate) <= new Date(pickupDate)) {
      setError("Return date must be after pickup date.");
      return;
    }
    if (!pricingBreakdown) {
      setError("Invalid date range.");
      return;
    }

    setSubmitting(true);
    try {
      // Auth check
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push(
          `/auth/login?redirect=${encodeURIComponent(`/fleet/${vehicle.id}`)}`
        );
        return;
      }

      // Fetch user profile id
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (!userRow) {
        setError("Your user profile was not found. Please contact support.");
        return;
      }

      const bookingRef = genRef();

      const { error: insertError } = await supabase.from("bookings").insert({
        booking_reference: bookingRef,
        user_id: userRow.id,
        vehicle_id: vehicle.id,
        pickup_location: pickup,
        return_location: dropoff,
        pickup_datetime: new Date(pickupDate).toISOString(),
        return_datetime: new Date(returnDate).toISOString(),
        booking_status: "pending",
        payment_status: "unpaid",
        total_amount: pricingBreakdown.totalAmount,
        deposit_amount: vehicle.security_deposit,
      });

      if (insertError) {
        setError(insertError.message || "Failed to create booking. Please try again.");
      } else {
        setSuccess(bookingRef);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-black text-2xl mb-2">Booking Confirmed! 🎉</h3>
          <p className="text-white/50 text-sm max-w-xs">
            Your reservation has been created. We&apos;ll be in touch to confirm details.
          </p>
          <p className="text-[#c9a84c] font-mono font-black text-lg mt-3">
            Ref: {success}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/client")}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push("/fleet")}
            className="px-6 py-3 rounded-xl font-semibold border border-white/20 text-white/70 text-sm hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            Back to Fleet
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Pickup Location */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          Pickup Location <span className="text-red-400">*</span>
        </label>
        <select
          id="pickup-location"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          required
          className="w-full bg-white/[0.04] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]/50 focus:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <option value="" className="bg-[#0a0f1e] text-white/40">Select pickup location…</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l} className="bg-[#0a0f1e]">{l}</option>
          ))}
        </select>
      </div>

      {/* Drop-off Location */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">
          Return Location <span className="text-red-400">*</span>
        </label>
        <select
          id="dropoff-location"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          required
          className="w-full bg-white/[0.04] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]/50 focus:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <option value="" className="bg-[#0a0f1e] text-white/40">Select return location…</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l} className="bg-[#0a0f1e]">{l}</option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pickup-datetime" className="block text-sm font-medium text-white/70 mb-1.5">
            Pickup Date & Time <span className="text-red-400">*</span>
          </label>
          <input
            id="pickup-datetime"
            type="datetime-local"
            min={today}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
            className="w-full bg-white/[0.04] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]/50 focus:bg-white/[0.06] transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label htmlFor="return-datetime" className="block text-sm font-medium text-white/70 mb-1.5">
            Return Date & Time <span className="text-red-400">*</span>
          </label>
          <input
            id="return-datetime"
            type="datetime-local"
            min={pickupDate || today}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
            className="w-full bg-white/[0.04] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]/50 focus:bg-white/[0.06] transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label htmlFor="special-notes" className="block text-sm font-medium text-white/70 mb-1.5">
          Special Requests
          <span className="text-white/30 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="special-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g. Hotel name for delivery, child seat needed, early pickup request…"
          className="w-full bg-white/[0.04] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]/50 focus:bg-white/[0.06] transition-colors resize-none placeholder:text-white/25"
        />
      </div>

      {/* Live pricing breakdown */}
      {pricingBreakdown && (
        <div className="rounded-xl bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-5 space-y-2.5">
          <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-wider mb-3">Price Breakdown</p>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              {pricingBreakdown.diffDays >= 1
                ? `${pricingBreakdown.diffDays} day${pricingBreakdown.diffDays > 1 ? "s" : ""} × ${formatINR(vehicle.daily_rate)}`
                : `${Math.ceil(pricingBreakdown.diffHours)} hr × ${formatINR(vehicle.hourly_rate)}`}
            </span>
            <span className="text-white font-semibold">{formatINR(pricingBreakdown.baseAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">GST (18%)</span>
            <span className="text-white font-semibold">{formatINR(pricingBreakdown.taxAmount)}</span>
          </div>
          <div className="h-px bg-white/10 my-1" />
          <div className="flex justify-between">
            <span className="text-white font-bold">Total</span>
            <span className="text-[#c9a84c] font-black text-xl">{formatINR(pricingBreakdown.totalAmount)}</span>
          </div>
          <p className="text-white/30 text-xs pt-1">
            + {formatINR(vehicle.security_deposit)} refundable security deposit
          </p>
        </div>
      )}

      <button
        id="submit-booking-btn"
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-xl font-black text-[#0a0f1e] bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] hover:shadow-lg hover:shadow-[#c9a84c]/25 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 text-base cursor-pointer"
      >
        {submitting ? "Creating Booking…" : "Confirm Reservation →"}
      </button>

      <p className="text-center text-white/25 text-xs">
        No payment required now · Booking pending staff confirmation
      </p>
    </form>
  );
}
