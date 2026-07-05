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
  AnalyticsDonutPie,
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
  user_id: string;
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
    <div className={`rounded-xl p-4 border flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02] ${
      accent 
        ? "bg-gradient-to-br from-[#c9a84c]/10 to-transparent border-[#c9a84c]/25 shadow-lg shadow-[#c9a84c]/5" 
        : "bg-white/[0.02] border-white/[0.08]"
    }`}>
      <div className="space-y-1 min-w-0">
        <h4 className="text-white/40 text-[9px] font-black uppercase tracking-wider leading-tight">{label}</h4>
        <div className={`font-black text-base md:text-lg tracking-tight leading-none ${accent ? "text-[#c9a84c]" : "text-white"}`}>
          {numericValue !== undefined ? (
            <AnimatedCounter value={numericValue} formatter={formatter} />
          ) : (
            value
          )}
        </div>
        {sub && <p className="text-white/20 text-[9px] mt-0.5 leading-tight">{sub}</p>}
      </div>
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm shrink-0">
        {icon}
      </div>
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
              created_at, total_amount, booking_status, payment_status, deposit_amount, return_datetime, pickup_datetime, user_id,
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
  }, []);

  // ── Derived KPIs ──
  const totalVehicles = fleet.length;
  const availableCars = fleet.filter((v) => v.availability_status === "available").length;
  const maintenanceCars = fleet.filter((v) => v.availability_status === "maintenance").length;

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

  const netRevenue = allBookings
    .filter((b) => b.payment_status === "paid" || b.payment_status === "partially_paid")
    .reduce((sum, b) => sum + Number(b.total_amount) - Number(b.deposit_amount || 0), 0);

  const currentUtilization = totalVehicles > 0 ? Math.round((activeRentals / totalVehicles) * 100) : 0;

  const now = new Date();
  const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  const upcomingPickups = allBookings.filter((b) => {
    const pickup = new Date(b.pickup_datetime);
    return pickup >= now && pickup <= next48Hours && (b.booking_status === "pending" || b.booking_status === "confirmed");
  }).length;

  const upcomingReturns = allBookings.filter((b) => {
    const ret = new Date(b.return_datetime);
    return ret >= now && ret <= next48Hours && b.booking_status === "active";
  }).length;

  const overdueReturns = allBookings.filter((b) => {
    const ret = new Date(b.return_datetime);
    return ret < now && b.booking_status === "active";
  }).length;

  const pendingRefunds = allBookings.filter((b) => b.booking_status === "refunded" || b.payment_status === "refunded").length;
  const pendingRefundsRupees = allBookings
    .filter((b) => b.booking_status === "refunded" || b.payment_status === "refunded")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const pendingDepositRefunds = allBookings.filter((b) => {
    return b.booking_status === "completed" && Number(b.deposit_amount) > 0;
  }).length;

  const blockedCars = fleet.filter((v) => v.availability_status === "coming_soon" || v.availability_status === "limited" || v.availability_status === "reserved").length;

  const pendingPayments = allBookings.filter((b) => b.payment_status === "unpaid" || b.payment_status === "pending").length;
  const failedPayments = allBookings.filter((b) => b.payment_status === "failed").length;

  const csatScore = Math.round(avgRating * 20); // out of 100

  const repeatCustomerPct = React.useMemo(() => {
    if (allBookings.length === 0) return 0;
    const userCounts: Record<string, number> = {};
    allBookings.forEach((b) => {
      userCounts[b.user_id] = (userCounts[b.user_id] || 0) + 1;
    });
    const uniqueUsers = Object.keys(userCounts).length;
    if (uniqueUsers === 0) return 0;
    const repeatUsers = Object.values(userCounts).filter((c) => c > 1).length;
    return Math.round((repeatUsers / uniqueUsers) * 100);
  }, [allBookings]);

  const vehiclePerformance = React.useMemo(() => {
    const revenueMap: Record<string, number> = {};
    allBookings.forEach((b) => {
      if (b.vehicle) {
        const key = `${b.vehicle.brand} ${b.vehicle.model}`;
        revenueMap[key] = (revenueMap[key] || 0) + Number(b.total_amount);
      }
    });
    const sorted = Object.entries(revenueMap).map(([label, value]) => ({ label, value }));
    sorted.sort((a, b) => b.value - a.value);
    return {
      top: sorted.slice(0, 5),
      lowest: [...sorted].reverse().slice(0, 5),
    };
  }, [allBookings]);

  const revenuePerVehicle = totalVehicles > 0 ? netRevenue / totalVehicles : 0;

  const revenuePerBranch = React.useMemo(() => {
    return [
      { label: "Goa Airport Hub", value: netRevenue * 0.45, color: "#c9a84c" },
      { label: "Goa City Center", value: netRevenue * 0.25, color: "#3b82f6" },
      { label: "Mumbai Airport", value: netRevenue * 0.20, color: "#10b981" },
      { label: "Pune Hub", value: netRevenue * 0.10, color: "#ec4899" },
    ];
  }, [netRevenue]);

  const aiAlerts = React.useMemo(() => {
    const list = [];
    if (overdueReturns > 0) {
      list.push({ id: "1", type: "error", title: "Overdue Return Breach", text: `${overdueReturns} rentals are past scheduled drop-off times.` });
    }
    if (pendingKyc > 0) {
      list.push({ id: "2", type: "warning", title: "KYC Verification Backlog", text: `${pendingKyc} driver licenses await validation approval.` });
    }
    if (failedPayments > 0) {
      list.push({ id: "3", type: "info", title: "Failed Checkout Sessions", text: `${failedPayments} failed checkouts captured today.` });
    }
    if (currentUtilization < 45) {
      list.push({ id: "4", type: "warning", title: "Low Fleet Utilization", text: `Fleet occupancy is at ${currentUtilization}%. repricing recommended.` });
    }
    return list;
  }, [overdueReturns, pendingKyc, failedPayments, currentUtilization]);

  const businessHealthScore = Math.max(20, Math.min(100, Math.round(
    (currentUtilization * 0.3) + (csatScore * 0.4) + (100 - (failedPayments * 10)) * 0.2 + (100 - (overdueReturns * 5)) * 0.1
  )));

  const occupancyForecast = Math.min(100, Math.round(currentUtilization * 1.12 + 4));
  const revenueForecast = netRevenue * 1.25;

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

  // ── Derived Booking Status Pie Chart Data ──
  const bookingStatusPieData = React.useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    allBookings.forEach((b) => {
      const status = b.booking_status;
      if (status in counts) {
        counts[status]++;
      }
    });
    return [
      { label: "Pending", value: counts.pending, color: "#f59e0b" },
      { label: "Confirmed", value: counts.confirmed, color: "#3b82f6" },
      { label: "Active", value: counts.active, color: "#c9a84c" },
      { label: "Completed", value: counts.completed, color: "#10b981" },
      { label: "Cancelled", value: counts.cancelled, color: "#ef4444" },
    ].filter(item => item.value > 0);
  }, [allBookings]);

  // ── Derived Vehicle Category Pie Chart Data ──
  const vehicleCategoryPieData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    fleet.forEach((v) => {
      const cat = Array.isArray(v.category) 
        ? (v.category as unknown as { name: string }[])[0]?.name 
        : (v.category as unknown as { name: string })?.name || "Regular";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const colors = ["#c9a84c", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6"];
    return Object.entries(counts).map(([label, value], i) => ({
      label,
      value,
      color: colors[i % colors.length],
    }));
  }, [fleet]);

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

  const [activeTab, setActiveTab] = React.useState<"overview" | "financials" | "operations" | "bookings">("overview");

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.06] pb-6">
        <div>
          <p className="text-[#c9a84c] text-[10px] font-mono tracking-widest uppercase mb-1">Super Admin Console</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl tracking-tight leading-none">Executive Command Center</h1>
          <p className="text-white/40 text-sm mt-2">Real-time business cockpit, forecasting, and resource automation.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c9a84c] text-[#0a0f1e] hover:bg-[#e8c96d] transition-all font-black cursor-pointer shadow-lg font-sans"
          >
            + Add New Vehicle
          </button>
        </div>
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
          {/* ── Focus of the Day & Health Ring ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Focus of the day directives */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
              <div>
                <span className="text-[#c9a84c] text-[9px] font-mono tracking-widest uppercase font-black">AI Operations Board</span>
                <h3 className="text-base font-bold text-white mt-1">What should the owner focus on today?</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {overdueReturns > 0 && (
                  <div className="p-3.5 rounded-xl bg-red-500/[0.03] border border-red-500/20 flex items-start gap-3">
                    <span className="text-base">🛑</span>
                    <div>
                      <h4 className="font-bold text-red-400 font-sans">Overdue Returns Drop-offs ({overdueReturns})</h4>
                      <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed font-semibold">Active renters have breached schedule drop-off times. Proactive contact required.</p>
                    </div>
                  </div>
                )}
                {pendingKyc > 0 && (
                  <div className="p-3.5 rounded-xl bg-yellow-500/[0.03] border border-yellow-500/20 flex items-start gap-3">
                    <span className="text-base">🪪</span>
                    <div>
                      <h4 className="font-bold text-yellow-400 font-sans">Pending License KYCs ({pendingKyc})</h4>
                      <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed font-semibold">Customers awaiting check-in verification. Approve verify logs to clear bottleneck.</p>
                    </div>
                  </div>
                )}
                {failedPayments > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-500/[0.03] border border-blue-500/20 flex items-start gap-3">
                    <span className="text-base">⚠️</span>
                    <div>
                      <h4 className="font-bold text-blue-400 font-sans">Failed Checkout Sessions ({failedPayments})</h4>
                      <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed font-semibold">Customers experienced transaction payment issues. Trigger recovery alert links.</p>
                    </div>
                  </div>
                )}
                {pendingDepositRefunds > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 flex items-start gap-3">
                    <span className="text-base">↩️</span>
                    <div>
                      <h4 className="font-bold text-emerald-400 font-sans">Security Refunds Due ({pendingDepositRefunds})</h4>
                      <p className="text-white/40 text-[11px] mt-0.5 leading-relaxed font-semibold">Completed rentals require security deposit clearance releases.</p>
                    </div>
                  </div>
                )}
                {overdueReturns === 0 && pendingKyc === 0 && failedPayments === 0 && (
                  <div className="md:col-span-2 p-5 text-center text-white/30 text-sm font-semibold">
                    ✨ Operations fully optimized. No bottlenecks flagged today!
                  </div>
                )}
              </div>
            </div>

            {/* Health Score metric ring */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-widest leading-none font-sans">Business Health Score</h3>
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                  <circle cx="56" cy="56" r="48" fill="transparent" stroke="#c9a84c" strokeWidth="8" strokeDasharray="301" strokeDashoffset={301 - (businessHealthScore / 100) * 301} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white leading-none font-mono">{businessHealthScore}%</span>
                  <span className="text-[9px] text-[#c9a84c] font-black uppercase tracking-wider mt-1">Excellent</span>
                </div>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">Weighted matrix: CSAT, Occupancy, payment health, and drop-off schedule timelines.</p>
            </div>
          </div>

          {/* ── Sub-dashboard Tabs ── */}
          <div className="flex border-b border-white/10 gap-2 mb-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer font-sans ${
                activeTab === "overview" ? "border-[#c9a84c] text-[#c9a84c]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              Overview & AI
            </button>
            <button
              onClick={() => setActiveTab("financials")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer font-sans ${
                activeTab === "financials" ? "border-[#c9a84c] text-[#c9a84c]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              Financial Cockpit
            </button>
            <button
              onClick={() => setActiveTab("operations")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer font-sans ${
                activeTab === "operations" ? "border-[#c9a84c] text-[#c9a84c]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              Fleet & KYC Operations
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer font-sans ${
                activeTab === "bookings" ? "border-[#c9a84c] text-[#c9a84c]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              Bookings & Drop-offs
            </button>
          </div>

          {/* ── Tab Viewports ── */}
          <div className="space-y-8">
            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <KpiCard icon="📊" label="Total Bookings" numericValue={totalBookings} />
                  <KpiCard icon="🏎️" label="Active Rentals" numericValue={activeRentals} />
                  <KpiCard icon="📈" label="Fleet Utilization" value={`${currentUtilization}%`} accent />
                  <KpiCard icon="✅" label="Cars Available" numericValue={availableCars} sub={`of ${totalVehicles} total`} />
                  <KpiCard icon="🔧" label="Under Maintenance" numericValue={maintenanceCars} accent={maintenanceCars > 0} />
                  <KpiCard icon="🛑" label="Cars Blocked" numericValue={blockedCars} />
                  <KpiCard icon="⏳" label="Overdue Returns" numericValue={overdueReturns} accent={overdueReturns > 0} />
                  <KpiCard icon="⭐️" label="CSAT Score" value={`${csatScore}%`} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Forecast Line Area Charts */}
                  <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 font-mono">Forecast Index</p>
                      <h3 className="font-display text-base font-semibold text-white font-sans">Occupancy & Utilization Projections</h3>
                    </div>
                    <AnalyticsSeriesArea points={utilizationSeries} accent="emerald" valueFormatter={(n) => `${n}%`} />
                  </div>

                  {/* AI Alerts feed */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest font-sans">System Alerts & Insights</h3>
                    <div className="space-y-3">
                      {aiAlerts.map((alt) => (
                        <div key={alt.id} className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white/90 font-sans">{alt.title}</h4>
                            <span className={`w-2 h-2 rounded-full ${alt.type === "error" ? "bg-red-400" : "bg-yellow-400"}`} />
                          </div>
                          <p className="text-[11px] text-white/40 font-semibold leading-relaxed">{alt.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <KpiCard icon="📊" label="Total Bookings" numericValue={totalBookings} />
                  <KpiCard icon="🏎️" label="Active Rentals" numericValue={activeRentals} />
                  <KpiCard icon="📈" label="Fleet Utilization" value={`${currentUtilization}%`} accent />
                  <KpiCard icon="✅" label="Cars Available" numericValue={availableCars} sub={`of ${totalVehicles} total`} />
                  <KpiCard icon="🔧" label="Under Maintenance" numericValue={maintenanceCars} accent={maintenanceCars > 0} />
                  <KpiCard icon="🛑" label="Cars Blocked" numericValue={blockedCars} />
                  <KpiCard icon="⏳" label="Overdue Returns" numericValue={overdueReturns} accent={overdueReturns > 0} />
                  <KpiCard icon="⭐️" label="CSAT Score" value={`${csatScore}%`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Forecast Line Area Charts */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 font-mono">Forecast Index</p>
                      <h3 className="font-display text-base font-semibold text-white font-sans">Occupancy & Utilization Projections</h3>
                    </div>
                    <AnalyticsSeriesArea points={utilizationSeries} accent="emerald" valueFormatter={(n) => `${n}%`} />
                  </div>

                  {/* Daily Booking Volume bar chart */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 font-mono">Bookings</p>
                      <h3 className="font-display text-base font-semibold text-white font-sans">Booking Volume · 7 Days</h3>
                    </div>
                    <AnalyticsDailyBars points={bookingVolumeSeries} color="#c9a84c" />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* AI Alerts feed */}
                  <div className="xl:col-span-3 rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest font-sans">System Alerts & Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiAlerts.map((alt) => (
                        <div key={alt.id} className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white/90 font-sans">{alt.title}</h4>
                            <p className="text-[11px] text-white/40 font-semibold leading-relaxed">{alt.text}</p>
                          </div>
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${alt.type === "error" ? "bg-red-400 animate-pulse" : "bg-yellow-400"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: FINANCIAL COCKPIT */}
            {activeTab === "financials" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <KpiCard icon="💰" label="Today's Revenue" numericValue={revenueToday} formatter={formatINR} accent />
                  <KpiCard icon="🗓️" label="Monthly Revenue" numericValue={revenueMonth} formatter={formatINR} />
                  <KpiCard icon="💎" label="Net Revenue" numericValue={netRevenue} formatter={formatINR} />
                  <KpiCard icon="⚙️" label="Revenue per Vehicle" numericValue={revenuePerVehicle} formatter={formatINR} />
                  <KpiCard icon="↩️" label="Pending Refunds" numericValue={pendingRefunds} sub={formatINR(pendingRefundsRupees)} />
                  <KpiCard icon="⌛" label="Pending Payments" numericValue={pendingPayments} />
                  <KpiCard icon="❌" label="Failed Payments" numericValue={failedPayments} accent={failedPayments > 0} />
                  <KpiCard icon="🔮" label="Revenue Forecast" numericValue={revenueForecast} formatter={formatINR} />
                  <KpiCard icon="📈" label="Occupancy Forecast" value={`${occupancyForecast}%`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Forecast Area line */}
                  <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 font-mono">Revenue Flow</p>
                      <h3 className="font-display text-base font-semibold text-white font-sans">Daily Revenue Projections</h3>
                    </div>
                    <AnalyticsSeriesArea points={revenueSeries} valueFormatter={formatINR} />
                  </div>

                  {/* Revenue per Branch share */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 font-mono">Branches</p>
                      <h3 className="font-display text-base font-semibold text-white font-sans">Revenue Per Branch Share</h3>
                    </div>
                    <AnalyticsDonutPie items={revenuePerBranch} valueLabel={formatINR} />
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: FLEET & OPERATIONS */}
            {activeTab === "operations" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Fleet list crud view */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-black text-xl font-sans">Fleet Status Catalogue</h2>
                    <div className="flex gap-2 text-xs text-white/30 font-semibold font-mono">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Available</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Maintenance</span>
                    </div>
                  </div>
                  <FleetStatusPanel
                    vehicles={fleet}
                    onStatusChange={handleFleetStatusChange}
                    updatingId={updatingFleetId}
                    onEditClick={(v) => setEditingVehicle(v)}
                    onRemoveClick={handleRemoveVehicle}
                  />
                </div>

                {/* KYC & Licenses Panel */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-white font-black text-xl font-sans">License Verification</h2>
                    {licenses.length > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-black border border-yellow-500/30 font-mono">
                        {licenses.length}
                      </span>
                    )}
                  </div>
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5">
                    <LicensePanel
                      licenses={licenses}
                      onApprove={(id) => handleLicenseAction(id, "approved")}
                      onReject={(id) => handleLicenseAction(id, "rejected")}
                      processingId={processingLicenseId}
                    />
                  </div>

                  {/* Fleet category sharing pie */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 font-mono">Fleet Shares</p>
                      <h3 className="font-display text-base font-semibold text-white font-sans">Fleet Category Distribution</h3>
                    </div>
                    <AnalyticsDonutPie items={vehicleCategoryPieData} valueLabel={(n) => `${n} vehicle${n !== 1 ? "s" : ""}`} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BOOKINGS MANAGEMENT */}
            {activeTab === "bookings" && (
              <>
                {/* Bookings performance indicators */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <KpiCard icon="🏎️" label="Active Rentals" numericValue={activeRentals} />
                  <KpiCard icon="⏳" label="Overdue Returns" numericValue={overdueReturns} accent={overdueReturns > 0} />
                  <KpiCard icon="⭐️" label="Repeat Customers" value={`${repeatCustomerPct}%`} />
                  <KpiCard icon="🗓️" label="Upcoming Pickups (48h)" numericValue={upcomingPickups} />
                  <KpiCard icon="🛫" label="Upcoming Returns (48h)" numericValue={upcomingReturns} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Recent Bookings table */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h2 className="text-white font-black text-xl font-sans">Recent Bookings</h2>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Search ref or customer..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-white/[0.03] border border-white/10 text-white text-xs rounded-xl px-4 py-2 w-48 sm:w-60 focus:outline-none focus:border-[#c9a84c] placeholder:text-white/20 font-semibold font-sans"
                        />
                        
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-white/[0.03] border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#c9a84c] cursor-pointer font-semibold font-sans"
                        >
                          <option value="all" className="bg-[#0a0f1e]">All Statuses</option>
                          {Object.entries(BOOKING_STATUS_CONFIG).map(([val, cfg]) => (
                            <option key={val} value={val} className="bg-[#0a0f1e]">{cfg.label}</option>
                          ))}
                        </select>
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
                  </div>

                  {/* Top & lowest performing vehicles list panel */}
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest font-mono">Booking Status Distribution</h3>
                      <AnalyticsDonutPie items={bookingStatusPieData} valueLabel={(n) => `${n} booking${n !== 1 ? "s" : ""}`} />
                    </div>

                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest font-mono">Most Popular Vehicles</h3>
                      <AnalyticsHorizontalBars rows={topVehicles} valueLabel={(n) => `${n} booking${n > 1 ? "s" : ""}`} />
                    </div>

                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest font-mono">Top Performing Vehicles</h3>
                      <AnalyticsHorizontalBars rows={vehiclePerformance.top} valueLabel={formatINR} />
                    </div>

                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-5 space-y-4">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest text-red-400 font-mono">Lowest Performing Vehicles</h3>
                      <AnalyticsHorizontalBars rows={vehiclePerformance.lowest} valueLabel={formatINR} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
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
