"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Car, 
  User, 
  CreditCard, 
  FileText, 
  Calendar, 
  Clock, 
  Activity, 
  FileSignature,
  SlidersHorizontal,
  ChevronDown,
  History,
  Wrench
} from "lucide-react";

// Design System Imports
import { PageHeader } from "@/components/ui/PageHeader";
import { Drawer } from "@/components/ui/Drawer";
import { Table, TableToolbar, Pagination } from "@/components/ui/Table";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Timeline } from "@/components/ui/Timeline";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  daily_rate: number;
}

interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  vehicle_id: string | null;
  pickup_location: string;
  return_location: string;
  pickup_datetime: string;
  return_datetime: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
  pickup_method?: string | null;
  insurance_tier?: string | null;
  addons?: string[] | null;
  preparation_checklist?: { cleaning: boolean; fuel: boolean; inspection: boolean } | null;
  assigned_vehicle_reg?: string | null;
  internal_notes?: string | null;
  audit_trail?: any[] | null;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    kyc_status?: string;
  } | null;
  vehicle: Vehicle | null;
}

interface BookingsCommandCenterClientProps {
  initialBookings: Booking[];
  vehicles: Vehicle[];
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BookingsCommandCenterClient({ initialBookings, vehicles }: BookingsCommandCenterClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection drawer & documents state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customerLicense, setCustomerLicense] = useState<any>(null);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync state with database after modifications
  const fetchUpdatedBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        user:users(first_name, last_name, email, phone, kyc_status),
        vehicle:vehicles(id, brand, model, registration_number, daily_rate)
      `)
      .order("created_at", { ascending: false });
    if (data) {
      setBookings(data as any);
    }
  };

  const selectedBooking = bookings.find(b => b.id === selectedId);

  // Fetch customer documents when drawer opens
  useEffect(() => {
    async function fetchLicense() {
      if (!selectedBooking) {
        setCustomerLicense(null);
        return;
      }
      setLoadingLicense(true);
      try {
        const { data } = await supabase
          .from("driver_licenses")
          .select("*")
          .eq("user_id", selectedBooking.user_id)
          .maybeSingle();
        setCustomerLicense(data || null);
      } catch (err) {
        console.error("[Bookings Table] Failed to load customer documents:", err);
      } finally {
        setLoadingLicense(false);
      }
    }
    fetchLicense();
  }, [selectedId, selectedBooking]);

  // Drawer update operations
  const handleAssignVehicle = async (vehicleId: string) => {
    if (!selectedBooking) return;
    const selectedVeh = vehicles.find(v => v.id === vehicleId);
    
    try {
      const auditLog = [
        ...(selectedBooking.audit_trail || []),
        {
          action: "vehicle_assigned",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: selectedVeh 
            ? `Assigned vehicle: ${selectedVeh.brand} ${selectedVeh.model} (${selectedVeh.registration_number})`
            : "Deassigned vehicle allocation"
        }
      ];

      const { error } = await supabase
        .from("bookings")
        .update({ 
          vehicle_id: vehicleId || null,
          assigned_vehicle_reg: selectedVeh ? selectedVeh.registration_number : null,
          audit_trail: auditLog
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;
      fetchUpdatedBookings();
    } catch (err) {
      console.error("Vehicle assignment error:", err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedBooking) return;
    try {
      const auditLog = [
        ...(selectedBooking.audit_trail || []),
        {
          action: "status_changed",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: `Stage transitioned to ${newStatus}`
        }
      ];

      const { error } = await supabase
        .from("bookings")
        .update({ 
          booking_status: newStatus,
          audit_trail: auditLog
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;
      fetchUpdatedBookings();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!selectedBooking) return;
    try {
      const auditLog = [
        ...(selectedBooking.audit_trail || []),
        {
          action: "payment_status_changed",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: `Payment state updated to ${newStatus}`
        }
      ];

      const { error } = await supabase
        .from("bookings")
        .update({ 
          payment_status: newStatus,
          audit_trail: auditLog
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;
      fetchUpdatedBookings();
    } catch (err) {
      console.error("Payment status update failed:", err);
    }
  };

  const handleChecklistToggle = async (key: "cleaning" | "fuel" | "inspection", val: boolean) => {
    if (!selectedBooking) return;
    const currentChecklist = selectedBooking.preparation_checklist || { cleaning: false, fuel: false, inspection: false };
    const updatedChecklist = { ...currentChecklist, [key]: val };

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ preparation_checklist: updatedChecklist })
        .eq("id", selectedBooking.id);

      if (error) throw error;
      fetchUpdatedBookings();
    } catch (err) {
      console.error("Checklist toggle failed:", err);
    }
  };

  const handleAddNote = async () => {
    if (!selectedBooking || !noteText.trim()) return;
    setSubmitting(true);

    try {
      const auditLog = [
        ...(selectedBooking.audit_trail || []),
        {
          action: "note_added",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: noteText
        }
      ];

      const { error } = await supabase
        .from("bookings")
        .update({ 
          internal_notes: selectedBooking.internal_notes 
            ? `${selectedBooking.internal_notes}\n[Manager Note]: ${noteText}` 
            : noteText,
          audit_trail: auditLog
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;
      setNoteText("");
      fetchUpdatedBookings();
    } catch (err) {
      console.error("Add note failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Status mapping to colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "confirmed":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "active":
      case "ready_for_pickup":
        return "bg-green-500/10 border-green-500/20 text-green-400";
      case "completed":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "cancelled":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-white/5 border-white/10 text-white/70";
    }
  };

  // Filters logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
      `${b.user?.first_name} ${b.user?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (b.vehicle?.brand || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.vehicle?.model || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.booking_status === statusFilter;
    const matchesPayment = paymentFilter === "all" || b.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      
      {/* ── Page Header ── */}
      <PageHeader
        title="Booking Operations"
        subtitle="Manage dispatch lanes, cleaning milestones, and vehicle handovers."
        contextTag="Prestige Control Center"
      >
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search reference or user..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 w-full md:w-56"
            />
          </div>

          {/* Filters triggers */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </PageHeader>

      {/* ─── TABLE VIEW ─── */}
      <Table
        headers={[
          "Booking ID",
          "Customer Name",
          "Vehicle",
          "Pickup Date",
          "Return Date",
          "Total Amount",
          "Deposit",
          "Booking Status",
          "Payment Status",
          "Actions"
        ]}
      >
        {currentItems.map((b) => (
          <tr 
            key={b.id} 
            onClick={() => setSelectedId(b.id)}
            className="hover:bg-white/[0.02] cursor-pointer transition-colors border-b border-white/5"
          >
            <td className="py-4 px-6 font-mono font-bold text-[#3B82F6]">#{b.booking_reference}</td>
            <td className="py-4 px-6 font-semibold">
              {b.user ? `${b.user.first_name} ${b.user.last_name}` : "Unknown Renter"}
            </td>
            <td className="py-4 px-6">
              {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : <span className="text-white/20 italic">Unassigned</span>}
            </td>
            <td className="py-4 px-6 font-mono">{new Date(b.pickup_datetime).toLocaleDateString()}</td>
            <td className="py-4 px-6 font-mono">{new Date(b.return_datetime).toLocaleDateString()}</td>
            <td className="py-4 px-6 font-mono font-bold text-right">{formatINR(b.total_amount)}</td>
            <td className="py-4 px-6 font-mono text-white/55 text-right">{formatINR(b.deposit_amount)}</td>
            <td className="py-4 px-6">
              <StatusBadge status={b.booking_status} />
            </td>
            <td className="py-4 px-6">
              <StatusBadge status={b.payment_status} />
            </td>
            <td className="py-4 px-6 text-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => { e.stopPropagation(); setSelectedId(b.id); }}
                className="text-[10px] uppercase font-bold py-1.5 h-auto rounded-xl"
              >
                Manage
              </Button>
            </td>
          </tr>
        ))}
        {currentItems.length === 0 && (
          <tr>
            <td colSpan={10} className="py-12 text-center text-white/30 font-mono italic">
              No bookings found matching select criteria.
            </td>
          </tr>
        )}
      </Table>

      {/* Pagination Actions */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredBookings.length}
        />
      )}

      {/* ─── Detail Drawer / Sidebar ─── */}
      <Drawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedId(null)}
        title="Manage Booking"
        subtitle={selectedBooking ? `Reference: #${selectedBooking.booking_reference}` : ""}
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6 text-left">
            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Customer Details</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  {selectedBooking.user?.first_name?.[0] || ""}{selectedBooking.user?.last_name?.[0] || ""}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">{selectedBooking.user?.first_name} {selectedBooking.user?.last_name}</h4>
                  <p className="text-white/40 text-xs mt-0.5">{selectedBooking.user?.email} | {selectedBooking.user?.phone}</p>
                  {selectedBooking.user?.kyc_status && (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold mt-2 border ${
                      selectedBooking.user.kyc_status === "approved" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      KYC: {selectedBooking.user.kyc_status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Booking & Stage Management */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Workflow Dispatch Status</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-white/40">Booking Stage</label>
                  <select
                    value={selectedBooking.booking_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-[#090a0f] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="active">Active Trip</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-white/40">Payment Status</label>
                  <select
                    value={selectedBooking.payment_status}
                    onChange={(e) => handlePaymentStatusChange(e.target.value)}
                    className="bg-[#090a0f] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Allocator */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Vehicle Allocation</span>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-white/40">Select Active Unit</label>
                <select
                  value={selectedBooking.vehicle_id || ""}
                  onChange={(e) => handleAssignVehicle(e.target.value)}
                  className="bg-[#090a0f] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Deallocate Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.registration_number})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checklist Gate */}
            {selectedBooking.booking_status === "ready_for_pickup" && (
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Preparation Checklist</span>
                <div className="space-y-2 text-xs text-white/80">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedBooking.preparation_checklist?.cleaning || false} 
                      onChange={(e) => handleChecklistToggle("cleaning", e.target.checked)}
                      className="rounded border-white/10 bg-black text-[#3B82F6]"
                    />
                    <span>Detailed Interior/Exterior Cleaning Completed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedBooking.preparation_checklist?.fuel || false} 
                      onChange={(e) => handleChecklistToggle("fuel", e.target.checked)}
                      className="rounded border-white/10 bg-black text-[#3B82F6]"
                    />
                    <span>Fuel Tank Topped Up (100% / Full charge)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedBooking.preparation_checklist?.inspection || false} 
                      onChange={(e) => handleChecklistToggle("inspection", e.target.checked)}
                      className="rounded border-white/10 bg-black text-[#3B82F6]"
                    />
                    <span>Safety Inspection Completed</span>
                  </label>
                </div>
              </div>
            )}

            {/* Customer Credentials */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Customer Credentials</span>
              {loadingLicense ? (
                <div className="text-[10px] text-white/30 font-mono py-2">Loading documents...</div>
              ) : customerLicense ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                    <div>
                      <span className="text-white/30 text-[8px] block uppercase">Licence Number</span>
                      <span className="text-white mt-0.5 block font-bold">{customerLicense.license_number}</span>
                    </div>
                    <div>
                      <span className="text-white/30 text-[9px] block uppercase">Govt ID ({customerLicense.govt_id_type || "N/A"})</span>
                      <span className="text-white mt-0.5 block font-bold">{customerLicense.govt_id_number || "Not uploaded"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {customerLicense.license_front_url && (
                      <a href={customerLicense.license_front_url} target="_blank" rel="noreferrer" className="block p-2 rounded bg-white/5 border border-white/10 text-[9px] uppercase text-[#3B82F6] hover:underline text-center">
                        Licence Front
                      </a>
                    )}
                    {customerLicense.license_back_url && (
                      <a href={customerLicense.license_back_url} target="_blank" rel="noreferrer" className="block p-2 rounded bg-white/5 border border-white/10 text-[9px] uppercase text-[#3B82F6] hover:underline text-center">
                        Licence Back
                      </a>
                    )}
                    {customerLicense.govt_id_url && (
                      <a href={customerLicense.govt_id_url} target="_blank" rel="noreferrer" className="block p-2 rounded bg-white/5 border border-white/10 text-[9px] uppercase text-[#3B82F6] hover:underline text-center">
                        Govt ID Scan
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-white/30 font-mono italic py-4">No verified credential scans exist for this customer profile.</div>
              )}
            </div>

            {/* Operations Audit Trail & Timeline */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Timeline & Audit Trails</span>
              <Timeline 
                events={(selectedBooking.audit_trail || []).map((log: any) => ({
                  user: log.verifier,
                  timestamp: log.timestamp,
                  action: log.action,
                  notes: log.note
                }))}
              />
            </div>

            {/* Internal Operational Notes */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Internal Notes</span>
              {selectedBooking.internal_notes ? (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white/70 whitespace-pre-line leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                  {selectedBooking.internal_notes}
                </div>
              ) : (
                <div className="text-xs text-white/20 italic">No manager notes written.</div>
              )}
              
              {/* Append Note Form */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add audit note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 bg-[#090a0f] border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 h-9"
                />
                <Button 
                  onClick={handleAddNote}
                  isLoading={submitting}
                  className="text-[10px] uppercase font-bold h-9 rounded-xl px-4 shrink-0"
                >
                  Add Note
                </Button>
              </div>
            </div>

          </div>
        )}
      </Drawer>
    </div>
  );
}
