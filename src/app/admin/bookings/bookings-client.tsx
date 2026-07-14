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
  ChevronDown
} from "lucide-react";

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
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-widest block mb-1">Prestige Control Center</span>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Booking Operations</h1>
          <p className="text-white/40 text-xs mt-1">Manage dispatch lanes, cleaning milestones, and vehicle handovers.</p>
        </div>
        
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
      </div>

      {/* ─── TABLE VIEW ─── */}
      <div className="border border-white/15 bg-white/[0.01] rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider bg-white/[0.02]">
                <th className="py-4 px-6">Booking ID</th>
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6">Pickup Date</th>
                <th className="py-4 px-6">Return Date</th>
                <th className="py-4 px-6 text-right">Total Amount</th>
                <th className="py-4 px-6 text-right">Deposit</th>
                <th className="py-4 px-6">Booking Status</th>
                <th className="py-4 px-6">Payment Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-white/80">
              {currentItems.map((b) => (
                <tr 
                  key={b.id} 
                  onClick={() => setSelectedId(b.id)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
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
                  <td className="py-4 px-6 text-right font-mono font-bold">{formatINR(b.total_amount)}</td>
                  <td className="py-4 px-6 text-right font-mono text-white/55">{formatINR(b.deposit_amount)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(b.booking_status)}`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      b.payment_status === "paid" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : b.payment_status === "refunded"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {b.payment_status}
                    </span>
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
            </tbody>
          </table>
        </div>

        {/* Pagination Actions */}
        {totalPages > 1 && (
          <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between bg-white/[0.01]">
            <span className="text-xs text-white/40">
              Page {currentPage} of {totalPages} ({filteredBookings.length} total bookings)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-xl flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1.5 h-auto"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1.5 h-auto"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Drawer / Sidebar ─── */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex justify-end select-none">
            {/* Dark glass overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
              onClick={() => setSelectedId(null)} 
            />
            
            {/* Luxury Drawer Panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="w-full max-w-xl bg-[#0c0d10] border-l border-white/10 h-full relative z-10 flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar"
            >
              
              <div className="space-y-6">
                
                {/* Header panel */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-[#3B82F6] uppercase tracking-wider">Reference: #{selectedBooking.booking_reference}</span>
                    <h3 className="text-white text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Manage Booking</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

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

                {/* Vehicle Details */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Vehicle Assignment</span>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/40">Allocated Fleet Unit</label>
                      <select
                        value={selectedBooking.vehicle_id || ""}
                        onChange={(e) => handleAssignVehicle(e.target.value)}
                        className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-3.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="">Deassign / select vehicle...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.registration_number})</option>
                        ))}
                      </select>
                    </div>

                    {selectedBooking.vehicle && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/5">
                        <Car className="w-5 h-5 text-[#3B82F6]" />
                        <div className="flex-1">
                          <h4 className="text-white text-xs font-bold">{selectedBooking.vehicle.brand} {selectedBooking.vehicle.model}</h4>
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mt-0.5">Reg: {selectedBooking.vehicle.registration_number}</span>
                        </div>
                        <div className="text-right font-mono text-xs text-white/55">
                          {formatINR(selectedBooking.vehicle.daily_rate)}/day
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checklist controls */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Preparation Checklist</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {["cleaning", "fuel", "inspection"].map((key) => {
                      const typedKey = key as "cleaning" | "fuel" | "inspection";
                      return (
                        <label key={key} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#090a0f]/40 border border-white/5 text-white/70 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBooking.preparation_checklist?.[typedKey] || false}
                            onChange={(e) => handleChecklistToggle(typedKey, e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="capitalize">{key}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Payment Information</span>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-[#090a0f] p-3 rounded-lg border border-white/5">
                      <span className="text-white/40 block text-[9px] uppercase font-bold">Grand Total</span>
                      <span className="text-white font-extrabold text-sm mt-0.5 block">{formatINR(selectedBooking.total_amount)}</span>
                    </div>
                    <div className="bg-[#090a0f] p-3 rounded-lg border border-white/5">
                      <span className="text-white/40 block text-[9px] uppercase font-bold">Security Deposit</span>
                      <span className="text-white font-extrabold text-sm mt-0.5 block">{formatINR(selectedBooking.deposit_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Uploaded Documents</span>
                  {loadingLicense ? (
                    <div className="text-[10px] text-white/30 font-mono py-4">Syncing credential scans...</div>
                  ) : customerLicense ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-4 font-mono">
                        <div>
                          <span className="text-white/30 text-[9px] block uppercase">Licence Number</span>
                          <span className="text-white mt-0.5 block font-bold">{customerLicense.license_number || "Not uploaded"}</span>
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
                  <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar font-mono text-[10px] text-white/60">
                    {selectedBooking.audit_trail && selectedBooking.audit_trail.length > 0 ? (
                      selectedBooking.audit_trail.map((log: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-[#3B82F6]/30 pl-3.5 space-y-0.5">
                          <div className="flex justify-between text-white/35">
                            <span>{log.verifier}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-white font-semibold">{log.note || log.action}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/20 italic">No operational logs logged.</div>
                    )}
                  </div>
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

              {/* Footer CTA */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={() => setSelectedId(null)}
                  variant="outline"
                  className="rounded-xl text-[10px] uppercase font-bold px-6 py-2 h-auto"
                >
                  Close Manager
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
