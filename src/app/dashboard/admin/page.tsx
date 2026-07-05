"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Vehicle, VehicleCategory, AvailabilityStatus } from "@/types/database";
import VehicleModal from "./VehicleModal";
import BookingDetailModal, { RecentBooking } from "./BookingDetailModal";
import {
  AnalyticsSeriesArea,
  AnalyticsDailyBars,
  AnalyticsHorizontalBars,
  AnimatedCounter,
} from "./AdminCharts";

// ─── Stats Types ──────────────────────────────────────────────────────────────
interface AllBookingStatsItem {
  created_at: string;
  total_amount: number;
  booking_status: string;
  payment_status: string;
  deposit_amount: number;
  pickup_datetime: string;
  return_datetime: string;
  vehicle: { brand: string; model: string } | null;
}

interface ReviewRatingItem {
  rating: number;
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────
function isToday(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  return d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FleetVehicle = Vehicle;

interface PendingLicense {
  id: string;
  license_number: string;
  issuing_country: string;
  expiry_date: string;
  created_at: string;
  user: { first_name: string; last_name: string; email: string } | null;
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

const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:          { label: "Pending",          color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20" },
  confirmed:        { label: "Confirmed",         color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  ready_for_pickup: { label: "Ready",             color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  active:           { label: "Active",            color: "text-[#c9a84c]",   bg: "bg-[#c9a84c]/10",   border: "border-[#c9a84c]/20" },
  completed:        { label: "Completed",         color: "text-white/50",    bg: "bg-white/[0.04]",   border: "border-white/10" },
  cancelled:        { label: "Cancelled",         color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
  refunded:         { label: "Refunded",          color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
};

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  available:    { label: "Available",    color: "text-emerald-400", bg: "bg-emerald-500/10",  dot: "bg-emerald-400" },
  limited:      { label: "Limited",      color: "text-yellow-400",  bg: "bg-yellow-500/10",   dot: "bg-yellow-400" },
  reserved:     { label: "Reserved",     color: "text-blue-400",    bg: "bg-blue-500/10",     dot: "bg-blue-400" },
  maintenance:  { label: "Maintenance",  color: "text-red-400",     bg: "bg-red-500/10",      dot: "bg-red-400" },
  coming_soon:  { label: "Coming Soon",  color: "text-white/40",    bg: "bg-white/[0.04]",    dot: "bg-white/20" },
};

const AVAILABILITY_OPTIONS = ["available", "limited", "reserved", "maintenance", "coming_soon"] as const;

// ─── Section: KPI Stats ───────────────────────────────────────────────────────
function KpiCard({ icon, label, value, numericValue, formatter, sub, accent }: {
  icon: string;
  label: string;
  value?: string | number;
  numericValue?: number;
  formatter?: (n: number) => string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] ${accent ? "bg-[#c9a84c]/5 border-[#c9a84c]/20" : "bg-white/[0.02] border-white/[0.08]"}`}>
      <p className="text-xl mb-2">{icon}</p>
      <p className={`font-black text-2xl tracking-tight leading-none ${accent ? "text-[#c9a84c]" : "text-white"}`}>
        {numericValue !== undefined ? (
          <AnimatedCounter value={numericValue} formatter={formatter} />
        ) : (
          value
        )}
      </p>
      <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mt-2.5">{label}</p>
      {sub && <p className="text-white/20 text-[10px] mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Section: Recent Bookings Table ──────────────────────────────────────────
function RecentBookingsTable({ bookings, onStatusChange, updatingId, onViewDetails }: {
  bookings: RecentBooking[];
  onStatusChange: (id: string, status: string) => void;
  updatingId: string | null;
  onViewDetails: (booking: RecentBooking) => void;
}) {
  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center text-white/30 text-sm">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {["Ref / Customer", "Vehicle", "Dates", "Amount", "Status", "Action"].map((h) => (
              <th key={h} className="text-left py-3 px-4 text-white/30 text-xs font-semibold uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {bookings.map((b) => {
            const sc = BOOKING_STATUS_CONFIG[b.booking_status] ?? BOOKING_STATUS_CONFIG.pending;
            const isUpdating = updatingId === b.id;
            return (
              <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-4 px-4">
                  <p className="text-white font-semibold font-mono text-xs">#{b.booking_reference}</p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {b.user ? `${b.user.first_name} ${b.user.last_name}` : "Unknown"}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-white/80 font-medium">
                    {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "—"}
                  </p>
                  {b.vehicle && (
                    <p className="text-white/30 text-xs">{b.vehicle.year}</p>
                  )}
                </td>
                <td className="py-4 px-4">
                  <p className="text-white/60 text-xs">{formatDate(b.pickup_datetime)}</p>
                  <p className="text-white/30 text-xs mt-0.5">→ {formatDate(b.return_datetime)}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-white font-bold">{formatINR(b.total_amount)}</p>
                  <p className={`text-xs mt-0.5 ${b.payment_status === "paid" ? "text-emerald-400" : "text-yellow-400"}`}>
                    {b.payment_status}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.color} ${sc.border}`}>
                    {sc.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <select
                      id={`status-select-${b.id}`}
                      disabled={isUpdating}
                      value={b.booking_status}
                      onChange={(e) => onStatusChange(b.id, e.target.value)}
                      className="bg-white/[0.05] border border-white/10 text-white/70 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#c9a84c]/50 disabled:opacity-50 cursor-pointer"
                    >
                      {Object.entries(BOOKING_STATUS_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val} className="bg-[#0a0f1e]">{cfg.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => onViewDetails(b)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#c9a84c] transition-all cursor-pointer"
                    >
                      View Details
                    </button>
                    {isUpdating && (
                      <span className="ml-1 text-white/30 text-xs">Saving…</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section: Fleet Status ─────────────────────────────────────────────────────
function FleetStatusPanel({
  vehicles,
  onStatusChange,
  updatingId,
  onEditClick,
  onRemoveClick,
}: {
  vehicles: FleetVehicle[];
  onStatusChange: (id: string, status: AvailabilityStatus) => void;
  updatingId: string | null;
  onEditClick: (v: FleetVehicle) => void;
  onRemoveClick: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {vehicles.map((v) => {
        const ac = AVAILABILITY_CONFIG[v.availability_status] ?? AVAILABILITY_CONFIG.available;
        return (
          <div
            key={v.id}
            className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 hover:border-white/[0.15] transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-white font-bold text-sm">{v.brand} {v.model}</p>
                <p className="text-white/35 text-xs">{v.year} · {v.category?.name ?? "—"}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ac.bg} ${ac.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ac.dot}`} />
                {ac.label}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-white/50 text-xs font-semibold">{formatINR(v.daily_rate)}/day</p>
                <select
                  id={`fleet-status-${v.id}`}
                  value={v.availability_status}
                  disabled={updatingId === v.id}
                  onChange={(e) => onStatusChange(v.id, e.target.value as AvailabilityStatus)}
                  className="bg-white/[0.05] border border-white/10 text-white/60 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#c9a84c]/40 disabled:opacity-50 cursor-pointer"
                >
                  {AVAILABILITY_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-[#0a0f1e]">{AVAILABILITY_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/[0.04]">
                <button
                  onClick={() => onEditClick(v)}
                  className="py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#c9a84c] transition-all cursor-pointer"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => onRemoveClick(v.id)}
                  disabled={updatingId === v.id}
                  className="py-1.5 rounded-lg text-xs font-semibold bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {updatingId === v.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section: License Verification ───────────────────────────────────────────
function LicensePanel({ licenses, onApprove, onReject, processingId }: {
  licenses: PendingLicense[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processingId: string | null;
}) {
  if (licenses.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-4xl mb-3">✅</p>
        <p className="text-white/50 text-sm">No pending licenses to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {licenses.map((lic) => (
        <div
          key={lic.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-yellow-500/5 border border-yellow-500/20"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Pending Review</span>
            </div>
            <p className="text-white font-bold">
              {lic.user ? `${lic.user.first_name} ${lic.user.last_name}` : "Unknown User"}
            </p>
            <p className="text-white/40 text-xs">{lic.user?.email}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/50">
              <span>License: <span className="text-white/70 font-mono">{lic.license_number}</span></span>
              <span>Country: {lic.issuing_country}</span>
              <span>Expires: {formatDate(lic.expiry_date)}</span>
              <span>Submitted: {formatDate(lic.created_at)}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              id={`approve-license-${lic.id}`}
              onClick={() => onApprove(lic.id)}
              disabled={processingId === lic.id}
              className="px-4 py-2 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              Approve
            </button>
            <button
              id={`reject-license-${lic.id}`}
              onClick={() => onReject(lic.id)}
              disabled={processingId === lic.id}
              className="px-4 py-2 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [bookings, setBookings] = React.useState<RecentBooking[]>([]);
  const [fleet, setFleet] = React.useState<FleetVehicle[]>([]);
  const [licenses, setLicenses] = React.useState<PendingLicense[]>([]);
  const [categories, setCategories] = React.useState<VehicleCategory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<FleetVehicle | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updatingBookingId, setUpdatingBookingId] = React.useState<string | null>(null);
  const [updatingFleetId, setUpdatingFleetId] = React.useState<string | null>(null);
  const [processingLicenseId, setProcessingLicenseId] = React.useState<string | null>(null);

  // Expanded Dashboard State
  const [selectedBooking, setSelectedBooking] = React.useState<RecentBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [updatingPayment, setUpdatingPayment] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const [allBookings, setAllBookings] = React.useState<AllBookingStatsItem[]>([]);
  const [reviews, setReviews] = React.useState<ReviewRatingItem[]>([]);

  React.useEffect(() => {
    async function fetchAll() {
      try {
        const [bookingsRes, fleetRes, licenseRes, categoriesRes, allBookingsRes, reviewsRes] = await Promise.all([
          supabase
            .from("bookings")
            .select(`
              id, booking_reference, booking_status, payment_status,
              total_amount, deposit_amount, created_at, pickup_datetime, return_datetime,
              pickup_location, return_location,
              user:users (first_name, last_name, email, phone),
              vehicle:vehicles (brand, model, year, registration_number, variant, category:vehicle_categories (name, slug))
            `)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("vehicles")
            .select(`*, category:vehicle_categories (name, slug)`)
            .order("brand", { ascending: true }),
          supabase
            .from("driver_licenses")
            .select(`id, license_number, issuing_country, expiry_date, created_at, user:users (first_name, last_name, email)`)
            .eq("verified_status", "pending")
            .order("created_at", { ascending: true }),
          supabase
            .from("vehicle_categories")
            .select("id, name, slug")
            .order("name", { ascending: true }),
          supabase
            .from("bookings")
            .select(`
              created_at, total_amount, booking_status, payment_status, deposit_amount, return_datetime, pickup_datetime,
              vehicle:vehicles (brand, model)
            `)
            .order("created_at", { ascending: true }),
          supabase
            .from("reviews")
            .select("rating"),
        ]);

        setBookings((bookingsRes.data as unknown as RecentBooking[]) ?? []);
        setFleet((fleetRes.data as unknown as FleetVehicle[]) ?? []);
        setLicenses((licenseRes.data as unknown as PendingLicense[]) ?? []);
        setCategories((categoriesRes.data as unknown as VehicleCategory[]) ?? []);
        setAllBookings((allBookingsRes.data as unknown as AllBookingStatsItem[]) ?? []);
        setReviews((reviewsRes.data as unknown as ReviewRatingItem[]) ?? []);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived KPIs ──
  const totalVehicles = fleet.length;
  const availableVehicles = fleet.filter((v) => v.availability_status === "available").length;
  const vehiclesMaintenance = fleet.filter((v) => v.availability_status === "maintenance").length;

  const totalBookings = allBookings.length;
  const activeRentals = allBookings.filter((b) => b.booking_status === "active").length;
  const pendingKyc = licenses.length;
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;

  const revenueToday = allBookings
    .filter((b) => (b.payment_status === "paid" || b.payment_status === "partially_paid") && isToday(b.created_at))
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const revenueMonth = allBookings
    .filter((b) => (b.payment_status === "paid" || b.payment_status === "partially_paid") && isThisMonth(b.created_at))
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const pendingRefunds = allBookings.filter((b) => b.booking_status === "refunded" || b.payment_status === "refunded").length;
  const pendingRefundsRupees = allBookings
    .filter((b) => b.booking_status === "refunded" || b.payment_status === "refunded")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const lateReturns = allBookings.filter((b) => b.booking_status === "active" && new Date(b.return_datetime) < new Date()).length;

  // ── Derived Charts Data (7 Days) ──
  const last7Days = React.useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  }, []);

  const bookingVolumeSeries = React.useMemo(() => {
    return last7Days.map((date) => {
      const count = allBookings.filter((b) => b.created_at.startsWith(date)).length;
      return { date, value: count };
    });
  }, [allBookings, last7Days]);

  const revenueSeries = React.useMemo(() => {
    return last7Days.map((date) => {
      const sum = allBookings
        .filter((b) => b.created_at.startsWith(date) && (b.payment_status === "paid" || b.payment_status === "partially_paid"))
        .reduce((sum, b) => sum + Number(b.total_amount), 0);
      return { date, value: sum };
    });
  }, [allBookings, last7Days]);

  const utilizationSeries = React.useMemo(() => {
    const totalCount = fleet.length || 1;
    return last7Days.map((date) => {
      const dateStart = new Date(date + "T00:00:00Z").getTime();
      const dateEnd = new Date(date + "T23:59:59Z").getTime();
      const activeCount = allBookings.filter((b) => {
        if (b.booking_status === "cancelled" || b.booking_status === "pending") return false;
        const pickup = new Date(b.pickup_datetime).getTime();
        const returnTime = new Date(b.return_datetime).getTime();
        return pickup <= dateEnd && returnTime >= dateStart;
      }).length;
      const pct = Math.round((activeCount / totalCount) * 100);
      return { date, value: Math.min(100, pct) };
    });
  }, [allBookings, fleet, last7Days]);

  const topVehicles = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allBookings.forEach((b) => {
      if (b.vehicle) {
        const key = `${b.vehicle.brand} ${b.vehicle.model}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allBookings]);

  // ── Filtering Logic ──
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === "all" || b.booking_status === statusFilter;
      const refMatches = b.booking_reference.toLowerCase().includes(searchQuery.toLowerCase());
      const custName = `${b.user?.first_name} ${b.user?.last_name}`.toLowerCase();
      const nameMatches = custName.includes(searchQuery.toLowerCase());
      const emailMatches = (b.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && (refMatches || nameMatches || emailMatches);
    });
  }, [bookings, searchQuery, statusFilter]);

  const handleBookingStatusChange = async (id: string, newStatus: string) => {
    setUpdatingBookingId(id);
    await supabase.from("bookings").update({ booking_status: newStatus }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, booking_status: newStatus } : b));
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => prev ? { ...prev, booking_status: newStatus } : null);
    }
    setUpdatingBookingId(null);
  };

  const handlePaymentStatusChange = async (id: string, newPaymentStatus: string) => {
    setUpdatingPayment(true);
    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: newPaymentStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update payment status: " + error.message);
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, payment_status: newPaymentStatus } : b))
      );
      setSelectedBooking((prev) => (prev && prev.id === id ? { ...prev, payment_status: newPaymentStatus } : prev));
    }
    setUpdatingPayment(false);
  };

  const handleFleetStatusChange = async (id: string, newStatus: AvailabilityStatus) => {
    setUpdatingFleetId(id);
    await supabase.from("vehicles").update({ availability_status: newStatus }).eq("id", id);
    setFleet((prev) => prev.map((v) => v.id === id ? { ...v, availability_status: newStatus } : v));
    setUpdatingFleetId(null);
  };

  const handleRemoveVehicle = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this vehicle from the fleet?")) {
      return;
    }
    setUpdatingFleetId(id);
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) {
        alert("Failed to delete vehicle: " + error.message);
      } else {
        setFleet((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      alert("Error deleting vehicle: " + errMsg);
    } finally {
      setUpdatingFleetId(null);
    }
  };

  const handleLicenseAction = async (id: string, action: "approved" | "rejected") => {
    setProcessingLicenseId(id);
    await supabase.from("driver_licenses").update({ verified_status: action }).eq("id", id);
    setLicenses((prev) => prev.filter((l) => l.id !== id));
    setProcessingLicenseId(null);
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-10">
        <p className="text-[#c9a84c] text-xs font-semibold uppercase tracking-[0.2em] mb-2">Staff Portal</p>
        <h1 className="text-white font-black text-3xl sm:text-4xl">Admin Overview</h1>
        <p className="text-white/40 text-sm mt-2">Fleet management, booking control, and license verification.</p>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/[0.08] animate-pulse" />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-white/[0.02] border border-white/[0.08] animate-pulse" />
        </div>
      ) : (
        <>
          {/* ── KPI Strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            <KpiCard icon="📊" label="Total Bookings"   numericValue={totalBookings} />
            <KpiCard icon="🏎️" label="Active Rentals"   numericValue={activeRentals} />
            <KpiCard icon="💰" label="Revenue Today"    numericValue={revenueToday} formatter={formatINR} accent />
            <KpiCard icon="📈" label="Revenue Month"    numericValue={revenueMonth} formatter={formatINR} />
            <KpiCard icon="🪪" label="Pending KYC"     numericValue={pendingKyc} accent={pendingKyc > 0} sub={pendingKyc > 0 ? "License reviews" : "Up to date"} />
            <KpiCard icon="✅" label="Available Fleet"  numericValue={availableVehicles} sub={`of ${totalVehicles} total`} />
            <KpiCard icon="🔧" label="In Maintenance"   numericValue={vehiclesMaintenance} accent={vehiclesMaintenance > 0} />
            <KpiCard icon="⏳" label="Late Returns"     numericValue={lateReturns} accent={lateReturns > 0} />
            <KpiCard icon="↩️" label="Pending Refunds"   numericValue={pendingRefunds} sub={formatINR(pendingRefundsRupees)} />
            <KpiCard icon="⭐️" label="Average Rating"   value={`${avgRating.toFixed(1)} / 5.0`} />
          </div>

          {/* ── Analytics Charts ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Bookings</p>
                <h3 className="font-display text-base font-semibold text-white">Booking volume · 7 days</h3>
              </div>
              <AnalyticsDailyBars points={bookingVolumeSeries} color="#c9a84c" />
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Revenue</p>
                <h3 className="font-display text-base font-semibold text-white">Revenue analytics · 7 days</h3>
              </div>
              <AnalyticsSeriesArea points={revenueSeries} valueFormatter={formatINR} />
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Fleet</p>
                <h3 className="font-display text-base font-semibold text-white">Vehicle utilization</h3>
              </div>
              <AnalyticsSeriesArea points={utilizationSeries} accent="emerald" valueFormatter={(n) => `${n}%`} />
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Demand</p>
                <h3 className="font-display text-base font-semibold text-white">Most popular vehicles</h3>
              </div>
              <AnalyticsHorizontalBars rows={topVehicles} valueLabel={(n) => `${n} booking${n > 1 ? "s" : ""}`} />
            </div>
          </section>

          {/* ── Recent Bookings ── */}
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <h2 className="text-white font-black text-xl">Recent Bookings</h2>
              
              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search ref or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 text-white text-xs rounded-xl px-4 py-2 w-48 sm:w-60 focus:outline-none focus:border-[#c9a84c] placeholder:text-white/20"
                />
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#c9a84c] cursor-pointer"
                >
                  <option value="all" className="bg-[#0a0f1e]">All Statuses</option>
                  {Object.entries(BOOKING_STATUS_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val} className="bg-[#0a0f1e]">{cfg.label}</option>
                  ))}
                </select>
                
                <span className="text-white/30 text-xs">{filteredBookings.length} shown</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
              <RecentBookingsTable
                bookings={filteredBookings}
                onStatusChange={handleBookingStatusChange}
                updatingId={updatingBookingId}
                onViewDetails={(b) => {
                  setSelectedBooking(b);
                  setIsDetailModalOpen(true);
                }}
              />
            </div>
          </section>

          {/* ── Fleet Status ── */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <h2 className="text-white font-black text-xl">Fleet Status</h2>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 transition-all cursor-pointer"
                >
                  + Add Vehicle
                </button>
              </div>
              <div className="flex gap-2 text-xs text-white/30">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Available</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Maintenance</span>
              </div>
            </div>
            <FleetStatusPanel
              vehicles={fleet}
              onStatusChange={handleFleetStatusChange}
              updatingId={updatingFleetId}
              onEditClick={(v) => setEditingVehicle(v)}
              onRemoveClick={handleRemoveVehicle}
            />
          </section>

          {/* ── License Verification ── */}
          <section id="licensing">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-white font-black text-xl">License Verification</h2>
              {licenses.length > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-black border border-yellow-500/30">
                  {licenses.length}
                </span>
              )}
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-6">
              <LicensePanel
                licenses={licenses}
                onApprove={(id) => handleLicenseAction(id, "approved")}
                onReject={(id) => handleLicenseAction(id, "rejected")}
                processingId={processingLicenseId}
              />
            </div>
          </section>
        </>
      )}

      {(isAddModalOpen || !!editingVehicle) && (
        <VehicleModal
          key={editingVehicle?.id || "new"}
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVehicle(null);
          }}
          categories={categories}
          vehicle={editingVehicle || undefined}
          onSaved={(savedVehicle) => {
            if (editingVehicle) {
              setFleet((prev) =>
                prev.map((v) => (v.id === savedVehicle.id ? savedVehicle : v)).sort((a, b) => a.brand.localeCompare(b.brand))
              );
            } else {
              setFleet((prev) =>
                [...prev, savedVehicle].sort((a, b) => a.brand.localeCompare(b.brand))
              );
            }
          }}
        />
      )}

      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onPaymentStatusChange={handlePaymentStatusChange}
        updatingPayment={updatingPayment}
      />

      {/* ── Operations Quick Command Links ── */}
      <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-8 mt-10">
        <a href="/dashboard/admin#licensing" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/10">
          🛡️ Review Driver Licenses (KYC)
        </a>
        <a href="/dashboard/admin#fleet" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/10">
          🏎️ Fleet Utilization & CRUD
        </a>
        <Link href="/fleet" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/10">
          🔍 Public Fleet Browser
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/10">
          🏠 Return to Homepage
        </Link>
      </div>
    </div>
  );
}
