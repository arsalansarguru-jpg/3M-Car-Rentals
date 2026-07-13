"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { VehicleWithCategory } from "@/types/database";
import { Button } from "@/components/ui/Button";

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

      // ── Compliance Check (Safety Safeguard) ──
      const { data: healthRow } = await supabase
        .from("vehicle_health")
        .select("insurance_expiry, puc_expiry, rc_expiry")
        .eq("vehicle_id", vehicle.id)
        .maybeSingle();

      if (healthRow) {
        const checkNow = new Date();
        const insExpired = new Date(healthRow.insurance_expiry) < checkNow;
        const pucExpired = new Date(healthRow.puc_expiry) < checkNow;
        const rcExpired = new Date(healthRow.rc_expiry) < checkNow;

        if (insExpired || pucExpired || rcExpired) {
          setError(
            "This vehicle is temporarily unavailable due to scheduled compliance inspection. Please select another vehicle."
          );
          setSubmitting(false);
          return;
        }
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
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center rounded-full">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-normal text-2xl mb-2" style={{ fontFamily: "var(--font-heading)" }}>Booking Confirmed!</h3>
          <p className="text-[#E8DCC8]/50 text-sm max-w-xs font-light" style={{ fontFamily: "var(--font-body)" }}>
            Your reservation has been created. We&apos;ll be in touch to confirm details.
          </p>
          <p className="text-[#C9A84C] font-mono font-bold text-lg mt-4">
            Ref: {success}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
          <Button
            onClick={() => router.push("/dashboard/client")}
            variant="primary"
            className="flex-1 rounded-[20px]"
          >
            View My Bookings
          </Button>
          <Button
            onClick={() => router.push("/fleet")}
            variant="outline"
            className="flex-1 rounded-[20px]"
          >
            Back to Fleet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-start gap-2.5 rounded-[20px]">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Pickup Location */}
      <div className="flex flex-col">
        <label className="text-[#E8DCC8]/65 text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ fontFamily: "var(--font-body)" }}>
          Pickup Location <span className="text-[#C9A84C]">*</span>
        </label>
        <select
          id="pickup-location"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          required
          className="w-full bg-white/[0.08] border border-white/12 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-colors cursor-pointer rounded-[20px]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <option value="" className="bg-[#121210] text-[#E8DCC8]/40">Select pickup location…</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l} className="bg-[#121210]">{l}</option>
          ))}
        </select>
      </div>

      {/* Drop-off Location */}
      <div className="flex flex-col">
        <label className="text-[#E8DCC8]/65 text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ fontFamily: "var(--font-body)" }}>
          Return Location <span className="text-[#C9A84C]">*</span>
        </label>
        <select
          id="dropoff-location"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          required
          className="w-full bg-white/[0.08] border border-white/12 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-colors cursor-pointer rounded-[20px]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <option value="" className="bg-[#121210] text-[#E8DCC8]/40">Select return location…</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l} className="bg-[#121210]">{l}</option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col">
          <label htmlFor="pickup-datetime" className="text-[#E8DCC8]/65 text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ fontFamily: "var(--font-body)" }}>
            Pickup Date & Time <span className="text-[#C9A84C]">*</span>
          </label>
          <input
            id="pickup-datetime"
            type="datetime-local"
            min={today}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
            className="w-full bg-white/[0.08] border border-white/12 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all [color-scheme:dark] rounded-[20px]"
            style={{ fontFamily: "var(--font-body)" }}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="return-datetime" className="text-[#E8DCC8]/65 text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ fontFamily: "var(--font-body)" }}>
            Return Date & Time <span className="text-[#C9A84C]">*</span>
          </label>
          <input
            id="return-datetime"
            type="datetime-local"
            min={pickupDate || today}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
            className="w-full bg-white/[0.08] border border-white/12 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all [color-scheme:dark] rounded-[20px]"
            style={{ fontFamily: "var(--font-body)" }}
          />
        </div>
      </div>

      {/* Special Requests */}
      <div className="flex flex-col">
        <label htmlFor="special-notes" className="text-[#E8DCC8]/65 text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ fontFamily: "var(--font-body)" }}>
          Special Requests
          <span className="text-[#E8DCC8]/30 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="special-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g. Hotel name for delivery, child seat needed, early pickup request…"
          className="w-full bg-white/[0.08] border border-white/12 text-white px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-colors resize-none placeholder:text-white/20 rounded-[20px]"
          style={{ fontFamily: "var(--font-body)" }}
        />
      </div>

      {/* Live pricing breakdown */}
      {pricingBreakdown && (
        <div className="border border-white/12 bg-white/[0.04] p-6 space-y-3.5 rounded-[20px] shadow-sm">
          <p className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ fontFamily: "var(--font-body)" }}>Price Breakdown</p>
          <div className="flex justify-between text-sm font-light text-[#E8DCC8]/70" style={{ fontFamily: "var(--font-body)" }}>
            <span>
              {pricingBreakdown.diffDays >= 1
                ? `${pricingBreakdown.diffDays} day${pricingBreakdown.diffDays > 1 ? "s" : ""} × ${formatINR(vehicle.daily_rate)}`
                : `${Math.ceil(pricingBreakdown.diffHours)} hr × ${formatINR(vehicle.hourly_rate)}`}
            </span>
            <span className="text-white font-medium">{formatINR(pricingBreakdown.baseAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-light text-[#E8DCC8]/70" style={{ fontFamily: "var(--font-body)" }}>
            <span>GST (18%)</span>
            <span className="text-white font-medium">{formatINR(pricingBreakdown.taxAmount)}</span>
          </div>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex justify-between items-baseline">
            <span className="text-white font-medium" style={{ fontFamily: "var(--font-body)" }}>Total</span>
            <span className="text-[#C9A84C] font-normal text-2xl" style={{ fontFamily: "var(--font-heading)" }}>{formatINR(pricingBreakdown.totalAmount)}</span>
          </div>
          <p className="text-[#E8DCC8]/35 text-xs pt-1 font-light" style={{ fontFamily: "var(--font-body)" }}>
            + {formatINR(vehicle.security_deposit)} refundable security deposit
          </p>
        </div>
      )}

      <Button
        id="submit-booking-btn"
        type="submit"
        disabled={submitting}
        variant="primary"
        className="w-full py-4 rounded-[20px]"
      >
        {submitting ? "Creating Booking…" : "Confirm Reservation →"}
      </Button>

      <p className="text-center text-[#E8DCC8]/30 text-xs font-light" style={{ fontFamily: "var(--font-body)" }}>
        No payment required now · Booking pending staff confirmation
      </p>
    </form>
  );
}
