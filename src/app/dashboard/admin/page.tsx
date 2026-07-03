"use client";

import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecentBooking {
  id: string;
  booking_reference: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  pickup_datetime: string;
  return_datetime: string;
  user: { first_name: string; last_name: string; email: string } | null;
  vehicle: { brand: string; model: string; year: number } | null;
}

interface FleetVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  availability_status: string;
  daily_rate: number;
  category: { name: string; slug: string } | null;
}

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
function KpiCard({ icon, label, value, sub, accent }: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 border ${accent ? "bg-[#c9a84c]/5 border-[#c9a84c]/20" : "bg-white/[0.02] border-white/[0.08]"}`}>
      <p className="text-2xl mb-3">{icon}</p>
      <p className={`font-black text-3xl ${accent ? "text-[#c9a84c]" : "text-white"}`}>{value}</p>
      <p className="text-white/50 text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-white/25 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Section: Recent Bookings Table ──────────────────────────────────────────
function RecentBookingsTable({ bookings, onStatusChange, updatingId }: {
  bookings: RecentBooking[];
  onStatusChange: (id: string, status: string) => void;
  updatingId: string | null;
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
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#c9a84c] transition-all cursor-pointer">
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
function FleetStatusPanel({ vehicles, onStatusChange, updatingId }: {
  vehicles: FleetVehicle[];
  onStatusChange: (id: string, status: string) => void;
  updatingId: string | null;
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
                  onChange={(e) => onStatusChange(v.id, e.target.value)}
                  className="bg-white/[0.05] border border-white/10 text-white/60 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-[#c9a84c]/40 disabled:opacity-50 cursor-pointer"
                >
                  {AVAILABILITY_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-[#0a0f1e]">{AVAILABILITY_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/[0.04]">
                <button className="py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#c9a84c] transition-all cursor-pointer">
                  Edit Details
                </button>
                <button className="py-1.5 rounded-lg text-xs font-semibold bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer">
                  Remove
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
  const [loading, setLoading] = React.useState(true);
  const [updatingBookingId, setUpdatingBookingId] = React.useState<string | null>(null);
  const [updatingFleetId, setUpdatingFleetId] = React.useState<string | null>(null);
  const [processingLicenseId, setProcessingLicenseId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchAll() {
      try {
        const [bookingsRes, fleetRes, licenseRes] = await Promise.all([
          supabase
            .from("bookings")
            .select(`
              id, booking_reference, booking_status, payment_status,
              total_amount, created_at, pickup_datetime, return_datetime,
              user:users (first_name, last_name, email),
              vehicle:vehicles (brand, model, year)
            `)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("vehicles")
            .select(`id, brand, model, year, availability_status, daily_rate, category:vehicle_categories (name, slug)`)
            .order("brand", { ascending: true }),
          supabase
            .from("driver_licenses")
            .select(`id, license_number, issuing_country, expiry_date, created_at, user:users (first_name, last_name, email)`)
            .eq("verified_status", "pending")
            .order("created_at", { ascending: true }),
        ]);

        setBookings((bookingsRes.data as unknown as RecentBooking[]) ?? []);
        setFleet((fleetRes.data as unknown as FleetVehicle[]) ?? []);
        setLicenses((licenseRes.data as unknown as PendingLicense[]) ?? []);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Derived KPIs ──
  const totalVehicles = fleet.length;
  const availableVehicles = fleet.filter((v) => v.availability_status === "available").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.created_at.startsWith(todayStr)).length;
  const pendingBookings = bookings.filter((b) => b.booking_status === "pending").length;

  const handleBookingStatusChange = async (id: string, newStatus: string) => {
    setUpdatingBookingId(id);
    await supabase.from("bookings").update({ booking_status: newStatus }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, booking_status: newStatus } : b));
    setUpdatingBookingId(null);
  };

  const handleFleetStatusChange = async (id: string, newStatus: string) => {
    setUpdatingFleetId(id);
    await supabase.from("vehicles").update({ availability_status: newStatus }).eq("id", id);
    setFleet((prev) => prev.map((v) => v.id === id ? { ...v, availability_status: newStatus } : v));
    setUpdatingFleetId(null);
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <KpiCard icon="🏎️" label="Total Vehicles"   value={totalVehicles}   />
            <KpiCard icon="✅" label="Available Now"    value={availableVehicles} accent sub={`of ${totalVehicles} fleet`} />
            <KpiCard icon="📅" label="Bookings Today"   value={todayBookings}   />
            <KpiCard icon="⏳" label="Pending Approval" value={pendingBookings}  />
          </div>

          {/* ── Recent Bookings ── */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-xl">Recent Bookings</h2>
              <span className="text-white/30 text-xs">{bookings.length} shown</span>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
              <RecentBookingsTable
                bookings={bookings}
                onStatusChange={handleBookingStatusChange}
                updatingId={updatingBookingId}
              />
            </div>
          </section>

          {/* ── Fleet Status ── */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <h2 className="text-white font-black text-xl">Fleet Status</h2>
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 transition-all cursor-pointer">
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
    </div>
  );
}
