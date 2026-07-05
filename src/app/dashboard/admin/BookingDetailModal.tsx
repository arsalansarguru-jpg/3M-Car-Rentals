"use client";

import React from "react";

export interface RecentBooking {
  id: string;
  booking_reference: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
  pickup_location: string;
  return_location: string;
  created_at: string;
  pickup_datetime: string;
  return_datetime: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    registration_number: string;
    variant: string | null;
    category: { name: string; slug: string } | null;
  } | null;
}

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: RecentBooking | null;
  onPaymentStatusChange: (id: string, newStatus: string) => Promise<void>;
  updatingPayment: boolean;
}

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

const BOOKING_STATUS_BADGES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:          { label: "Pending",          color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20" },
  confirmed:        { label: "Confirmed",         color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  ready_for_pickup: { label: "Ready for Pickup",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  active:           { label: "Active Rental",     color: "text-[#c9a84c]",   bg: "bg-[#c9a84c]/10",   border: "border-[#c9a84c]/20" },
  completed:        { label: "Completed",         color: "text-white/50",    bg: "bg-white/[0.04]",   border: "border-white/10" },
  cancelled:        { label: "Cancelled",         color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
  refunded:         { label: "Refunded",          color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
};

const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Fully Paid" },
  { value: "refunded", label: "Refunded" },
];

export default function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  onPaymentStatusChange,
  updatingPayment,
}: BookingDetailModalProps) {
  if (!isOpen || !booking) return null;

  const statusCfg = BOOKING_STATUS_BADGES[booking.booking_status] ?? BOOKING_STATUS_BADGES.pending;
  const fullName = booking.user ? `${booking.user.first_name} ${booking.user.last_name}`.trim() : "Unknown Customer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0a0f1e] border border-white/[0.08] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#060b18]">
          <div>
            <span className="text-[#c9a84c] text-[10px] font-mono tracking-widest uppercase">
              Booking ID: #{booking.booking_reference}
            </span>
            <h2 className="text-xl font-black text-white mt-1">Reservation Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Row */}
          <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-3">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Booking Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="payment-status-select" className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                Payment Status
              </label>
              <select
                id="payment-status-select"
                disabled={updatingPayment}
                value={booking.payment_status}
                onChange={(e) => onPaymentStatusChange(booking.id, e.target.value)}
                className="bg-white/[0.05] border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#c9a84c]/50 disabled:opacity-50 cursor-pointer"
              >
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0a0f1e]">
                    {opt.label}
                  </option>
                ))}
              </select>
              {updatingPayment && <span className="text-white/30 text-xs animate-pulse">Saving...</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <h3 className="text-[#c9a84c] text-xs font-bold uppercase tracking-wider">Customer Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Name</p>
                  <p className="text-white font-semibold mt-0.5">{fullName}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Email Address</p>
                  <p className="text-white/80 font-medium mt-0.5 break-all">{booking.user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Phone Number</p>
                  <p className="text-white/80 font-medium mt-0.5">{booking.user?.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <h3 className="text-[#c9a84c] text-xs font-bold uppercase tracking-wider">Vehicle Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Make / Model</p>
                  <p className="text-white font-semibold mt-0.5">
                    {booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "—"}
                    {booking.vehicle?.variant && (
                      <span className="text-white/35 font-normal text-xs ml-2">({booking.vehicle.variant})</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">License Plate Number</p>
                  <p className="text-white/80 font-mono font-bold mt-0.5 uppercase tracking-wider">
                    {booking.vehicle?.registration_number || "—"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Year</p>
                    <p className="text-white/80 font-medium mt-0.5">{booking.vehicle?.year || "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">Category</p>
                    <p className="text-[#c9a84c] font-semibold mt-0.5">
                      {booking.vehicle?.category?.name || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Section */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <h3 className="text-[#c9a84c] text-xs font-bold uppercase tracking-wider">Trip Logistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">📅 Pickup Details</p>
                <p className="text-white font-bold mt-1.5">{formatDateTime(booking.pickup_datetime)}</p>
                <p className="text-white/60 text-xs mt-1">{booking.pickup_location}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">🏁 Return Details</p>
                <p className="text-white font-bold mt-1.5">{formatDateTime(booking.return_datetime)}</p>
                <p className="text-white/60 text-xs mt-1">{booking.return_location}</p>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-5 rounded-2xl bg-[#c9a84c]/5 border border-[#c9a84c]/20 space-y-3.5">
            <h3 className="text-[#c9a84c] text-xs font-bold uppercase tracking-wider">Financial Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Base Rental Total (including taxes)</span>
                <span className="text-white font-semibold">{formatINR(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Refundable Security Deposit</span>
                <span className="text-white font-semibold">{formatINR(booking.deposit_amount)}</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between items-end">
                <span className="text-white font-bold">Total Customer Hold</span>
                <span className="text-[#c9a84c] font-black text-lg">
                  {formatINR(booking.total_amount + booking.deposit_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.08] flex justify-end bg-[#060b18]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
