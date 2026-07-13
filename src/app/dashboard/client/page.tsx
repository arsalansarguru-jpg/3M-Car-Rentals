"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookingRow {
  id: string;
  booking_reference: string;
  pickup_location: string;
  return_location: string;
  pickup_datetime: string;
  return_datetime: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
  created_at: string;
  vehicle: {
    brand: string;
    model: string;
    variant: string | null;
    year: number;
    fuel_type: string;
    transmission: string;
    category: { name: string; slug: string } | null;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending:          { label: "Pending",          color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  dot: "bg-yellow-400" },
  confirmed:        { label: "Confirmed",         color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    dot: "bg-blue-400" },
  ready_for_pickup: { label: "Ready for Pickup",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  active:           { label: "Active",            color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    dot: "bg-blue-400" },
  completed:        { label: "Completed",         color: "text-white/50",    bg: "bg-white/[0.04]",   border: "border-white/10",       dot: "bg-white/30" },
  cancelled:        { label: "Cancelled",         color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     dot: "bg-red-400" },
  refunded:         { label: "Refunded",          color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  dot: "bg-purple-400" },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  unpaid:           { label: "Unpaid",          color: "text-red-400" },
  partially_paid:   { label: "Partial",         color: "text-yellow-400" },
  paid:             { label: "Paid",            color: "text-emerald-400" },
  refunded:         { label: "Refunded",        color: "text-purple-400" },
};

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({
  booking,
  onCancel,
  cancelling,
}: {
  booking: BookingRow;
  onCancel: (id: string) => void;
  cancelling: string | null;
}) {
  const status = STATUS_CONFIG[booking.booking_status] ?? STATUS_CONFIG.pending;
  const payment = PAYMENT_CONFIG[booking.payment_status] ?? PAYMENT_CONFIG.unpaid;
  const canCancel = ["pending", "confirmed"].includes(booking.booking_status);
  const vehicle = booking.vehicle;

  return (
    <div className="group relative rounded-[20px] bg-white/[0.08] backdrop-blur-xl border border-white/12 hover:border-blue-500/35 hover:shadow-[0_15px_35px_-8px_rgba(0,0,0,0.6),0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 overflow-hidden shadow-sm">
      {/* Interaction left blue line */}
      <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[#E8DCC8]/40 text-[10px] font-mono tracking-widest uppercase mb-1.5">
              #{booking.booking_reference}
            </p>
            <h3
              className="text-white leading-tight"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                fontWeight: 400,
              }}
            >
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Vehicle"}
              {vehicle?.variant && (
                <span
                  className="font-light text-[#E8DCC8]/30 ml-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9375rem",
                  }}
                >
                  {vehicle.variant}
                </span>
              )}
            </h3>
            {vehicle && (
              <p className="text-[#E8DCC8]/40 text-xs mt-1.5 font-light" style={{ fontFamily: "var(--font-body)" }}>
                {vehicle.year} · {vehicle.fuel_type} · {vehicle.transmission}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-[10px] font-semibold border ${status.bg} ${status.color} ${status.border} uppercase tracking-wider`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className={`text-xs font-medium uppercase tracking-wider ${payment.color}`}>
              {payment.label}
            </span>
          </div>
        </div>

        {/* ── Details grid ── */}
        <div className="grid grid-cols-2 gap-4 p-5 rounded-[20px] bg-white/[0.04] border border-white/5 mb-5">
          <div>
            <p className="text-[#E8DCC8]/30 text-[9px] font-semibold uppercase tracking-wider mb-1.5">Pickup</p>
            <p className="text-white/80 text-xs font-medium">{booking.pickup_location}</p>
            <p className="text-white/40 text-[11px] mt-1 font-light">{formatDateTime(booking.pickup_datetime)}</p>
          </div>
          <div>
            <p className="text-[#E8DCC8]/30 text-[9px] font-semibold uppercase tracking-wider mb-1.5">Return</p>
            <p className="text-white/80 text-xs font-medium">{booking.return_location}</p>
            <p className="text-white/40 text-[11px] mt-1 font-light">{formatDateTime(booking.return_datetime)}</p>
          </div>
        </div>

        {/* ── Footer: Amount + Action ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5">
          <div>
            <p className="text-[#E8DCC8]/30 text-[9px] uppercase tracking-wider font-semibold">Total</p>
            <p className="text-white font-normal text-2xl" style={{ fontFamily: "var(--font-heading)" }}>{formatINR(booking.total_amount)}</p>
            <p className="text-[#E8DCC8]/25 text-[11px] font-light mt-0.5">+ {formatINR(booking.deposit_amount)} refundable deposit</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-[20px]"
            >
              View Details
            </Button>
            {booking.payment_status === "paid" ? (
              <Button
                variant="primary"
                size="sm"
                className="rounded-[20px]"
              >
                Download Receipt
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                className="rounded-[20px]"
              >
                Pay Now
              </Button>
            )}
            {canCancel && (
              <Button
                id={`cancel-booking-${booking.id}`}
                onClick={() => onCancel(booking.id)}
                disabled={cancelling === booking.id}
                variant="danger"
                size="sm"
                className="rounded-[20px]"
              >
                {cancelling === booking.id ? "Cancelling…" : "Cancel"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyBookings() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white/[0.08] backdrop-blur-xl border border-white/12 rounded-[20px] shadow-sm">
      <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
        <svg className="w-9 h-9 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-white font-normal text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>No bookings yet</p>
        <p className="text-[#E8DCC8]/40 text-sm max-w-xs font-light">
          You haven&apos;t made any reservations. Browse our premium fleet and book your first ride.
        </p>
      </div>
      <Button
        onClick={() => window.location.href = "/fleet"}
        variant="primary"
        className="rounded-[20px] py-3.5 px-6"
      >
        🏎️ Browse the Fleet
      </Button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientDashboardPage() {
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cancelling, setCancelling] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchBookings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get user record
        const { data: userRow } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (!userRow) {
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select(`
            id, booking_reference, pickup_location, return_location,
            pickup_datetime, return_datetime, booking_status, payment_status,
            total_amount, deposit_amount, created_at,
            vehicle:vehicles (
              brand, model, variant, year, fuel_type, transmission,
              category:vehicle_categories (name, slug)
            )
          `)
          .eq("user_id", userRow.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError("Failed to load bookings. Please refresh.");
        } else {
          setBookings((data as unknown as BookingRow[]) ?? []);
        }
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId);
    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ booking_status: "cancelled" })
        .eq("id", bookingId);

      if (updateError) {
        alert("Could not cancel booking. Please contact support.");
      } else {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, booking_status: "cancelled" } : b
          )
        );
      }
    } finally {
      setCancelling(null);
    }
  };

  // ── Derived stats ──
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => ["active", "ready_for_pickup", "confirmed"].includes(b.booking_status)).length;
  const completedBookings = bookings.filter((b) => b.booking_status === "completed").length;
  const totalSpent = bookings
    .filter((b) => b.payment_status === "paid" || b.payment_status === "partially_paid")
    .reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[#C9A84C] text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-body)" }}>My Dashboard</p>
          <h1 className="text-white font-normal text-3xl sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>My Bookings</h1>
          <p className="text-[#E8DCC8]/40 text-sm mt-2 font-light">View and manage all your vehicle reservations.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-[20px]"
          onClick={() => window.location.href = "/dashboard/profile"}
        >
          <svg className="w-4 h-4 text-[#C9A84C] mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Update Profile
        </Button>
      </div>

      {/* ── Stats strip (KPI Glass Cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Bookings",  value: totalBookings,    icon: "📅", color: "text-white" },
          { label: "Active / Upcoming", value: activeBookings, icon: "🔑", color: "text-blue-400" },
          { label: "Completed",       value: completedBookings, icon: "✅", color: "text-emerald-400" },
          { label: "Total Spent",     value: formatINR(totalSpent), icon: "💳", color: "text-white" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] bg-white/[0.08] backdrop-blur-xl border border-white/12 p-6 shadow-sm"
          >
            <p className="text-2xl mb-4">{stat.icon}</p>
            <p className={`font-normal text-2xl ${stat.color}`} style={{ fontFamily: "var(--font-heading)" }}>{stat.value}</p>
            <p className="text-[#E8DCC8]/40 text-[10px] uppercase tracking-wider font-semibold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 p-4 rounded-[20px] bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Bookings list ── */}
      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-[20px] bg-white/[0.08] border border-white/12 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyBookings />
      ) : (
        <>
          <div className="flex items-center justify-between mb-5 px-1">
            <p className="text-[#E8DCC8]/40 text-sm font-light">
              <span className="text-white font-medium">{bookings.length}</span>{" "}
              {bookings.length === 1 ? "reservation" : "reservations"} found
            </p>
            <Button
              variant="primary"
              size="sm"
              className="rounded-[20px]"
              onClick={() => window.location.href = "/fleet"}
              id="client-book-another-btn"
            >
              + Book Another
            </Button>
          </div>
          <div className="space-y-5">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
