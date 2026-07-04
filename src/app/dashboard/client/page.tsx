"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  active:           { label: "Active",            color: "text-[#c9a84c]",   bg: "bg-[#c9a84c]/10",   border: "border-[#c9a84c]/20",   dot: "bg-[#c9a84c]" },
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
    <div className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 overflow-hidden">
      {/* Gold accent strip on hover */}
      <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-[#c9a84c] to-[#e8c96d] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-white/35 text-xs font-mono tracking-widest uppercase mb-1">
              #{booking.booking_reference}
            </p>
            <h3 className="text-white font-black text-lg leading-tight">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Vehicle"}
              {vehicle?.variant && (
                <span className="text-white/35 font-normal text-sm ml-2">{vehicle.variant}</span>
              )}
            </h3>
            {vehicle && (
              <p className="text-white/40 text-xs mt-0.5">
                {vehicle.year} · {vehicle.fuel_type} · {vehicle.transmission}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color} ${status.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className={`text-xs font-semibold ${payment.color}`}>
              {payment.label}
            </span>
          </div>
        </div>

        {/* ── Details grid ── */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-5">
          <div>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">Pickup</p>
            <p className="text-white/70 text-xs font-medium">{booking.pickup_location}</p>
            <p className="text-white/40 text-xs mt-0.5">{formatDateTime(booking.pickup_datetime)}</p>
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">Return</p>
            <p className="text-white/70 text-xs font-medium">{booking.return_location}</p>
            <p className="text-white/40 text-xs mt-0.5">{formatDateTime(booking.return_datetime)}</p>
          </div>
        </div>

        {/* ── Footer: Amount + Action ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-white/[0.04]">
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-wider font-semibold">Total</p>
            <p className="text-white font-black text-xl">{formatINR(booking.total_amount)}</p>
            <p className="text-white/25 text-xs">+ {formatINR(booking.deposit_amount)} refundable deposit</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer">
              View Details
            </button>
            {booking.payment_status === "paid" ? (
              <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#c9a84c]/30 bg-[#c9a84c]/10 text-[#c9a84c] hover:bg-[#c9a84c]/20 transition-colors cursor-pointer">
                Download Receipt
              </button>
            ) : (
              <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                Pay Now
              </button>
            )}
            {canCancel && (
              <button
                id={`cancel-booking-${booking.id}`}
                onClick={() => onCancel(booking.id)}
                disabled={cancelling === booking.id}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {cancelling === booking.id ? "Cancelling…" : "Cancel"}
              </button>
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
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
        <svg className="w-9 h-9 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-lg mb-2">No bookings yet</p>
        <p className="text-white/40 text-sm max-w-xs">
          You haven&apos;t made any reservations. Browse our premium fleet and book your first ride.
        </p>
      </div>
      <Link
        href="/fleet"
        id="empty-browse-fleet-btn"
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] text-sm hover:shadow-lg hover:shadow-[#c9a84c]/20 hover:-translate-y-0.5 transition-all duration-200"
      >
        🏎️ Browse the Fleet
      </Link>
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
          <p className="text-[#c9a84c] text-xs font-semibold uppercase tracking-[0.2em] mb-2">My Dashboard</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl">My Bookings</h1>
          <p className="text-white/40 text-sm mt-2">View and manage all your vehicle reservations.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer">
          <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Update Profile
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Bookings",  value: totalBookings,    icon: "📅", color: "text-white" },
          { label: "Active / Upcoming", value: activeBookings, icon: "🔑", color: "text-[#c9a84c]" },
          { label: "Completed",       value: completedBookings, icon: "✅", color: "text-emerald-400" },
          { label: "Total Spent",     value: formatINR(totalSpent), icon: "💳", color: "text-white" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5"
          >
            <p className="text-2xl mb-3">{stat.icon}</p>
            <p className={`font-black text-2xl ${stat.color}`}>{stat.value}</p>
            <p className="text-white/35 text-xs font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Bookings list ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-white/[0.02] border border-white/[0.08] animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyBookings />
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-white/40 text-sm">
              <span className="text-white font-semibold">{bookings.length}</span>{" "}
              {bookings.length === 1 ? "reservation" : "reservations"} found
            </p>
            <Link
              href="/fleet"
              id="client-book-another-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#c9a84c]/20 transition-all duration-200"
            >
              + Book Another
            </Link>
          </div>
          <div className="space-y-4">
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
