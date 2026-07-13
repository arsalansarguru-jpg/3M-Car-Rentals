"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { format, addDays, startOfToday } from "date-fns";
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Filter, 
  SlidersHorizontal, 
  Plus,
  Layers,
  KanbanSquare,
  Sparkles,
  Info,
  CheckSquare,
  AlertTriangle,
  User,
  Car,
  FileSignature,
  DollarSign,
  ChevronRight,
  TrendingUp,
  X,
  FileText
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
  booking_status: "pending" | "confirmed" | "ready_for_pickup" | "active" | "completed" | "cancelled";
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
  pickup_method: string | null;
  insurance_tier: string | null;
  addons: string[] | null;
  preparation_checklist: { cleaning: boolean; fuel: boolean; inspection: boolean } | null;
  assigned_vehicle_reg: string | null;
  internal_notes: string | null;
  audit_trail: any[] | null;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;
  vehicle: Vehicle | null;
}

const STAGES = [
  { id: "pending", label: "Pending Review", color: "border-amber-500/20 bg-amber-500/5 text-amber-300" },
  { id: "confirmed", label: "Confirmed", color: "border-blue-500/20 bg-blue-500/5 text-blue-300" },
  { id: "ready_for_pickup", label: "Ready for Pickup", color: "border-purple-500/20 bg-purple-500/5 text-purple-300" },
  { id: "active", label: "Active Trip", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" },
  { id: "completed", label: "Completed", color: "border-slate-500/20 bg-slate-500/5 text-slate-400" },
  { id: "cancelled", label: "Cancelled", color: "border-red-500/20 bg-red-500/5 text-red-400" }
];

export default function BookingsCommandCenter() {
  const [viewMode, setViewMode] = useState<"kanban" | "timeline">("kanban");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Selection drawer state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Timeline helpers
  const today = startOfToday();
  const timelineDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const fetchBookingsAndVehicles = async () => {
    try {
      // Fetch Bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          user:users(first_name, last_name, email, phone),
          vehicle:vehicles(id, brand, model, registration_number, daily_rate)
        `);

      if (bookingsData) {
        setBookings(bookingsData as any);
      }

      // Fetch Vehicles
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("id, brand, model, registration_number, daily_rate");

      if (vehiclesData) {
        setVehicles(vehiclesData as any);
      }

    } catch (err) {
      console.error("Fetch bookings failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndVehicles();
  }, []);

  const selectedBooking = bookings.find(b => b.id === selectedId);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: any) => {
    e.preventDefault();
    const bookingId = e.dataTransfer.getData("text/plain");
    if (!bookingId) return;

    // Optimistic UI updates
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b));

    try {
      const bObj = bookings.find(b => b.id === bookingId);
      const auditLog = [
        ...(bObj?.audit_trail || []),
        {
          action: "status_changed",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: `Stage transitioned to ${newStatus} via Kanban board.`
        }
      ];

      await supabase
        .from("bookings")
        .update({ 
          booking_status: newStatus,
          audit_trail: auditLog
        })
        .eq("id", bookingId);

      fetchBookingsAndVehicles();
    } catch (err) {
      console.error("Drop status update failed:", err);
    }
  };

  // Drawer update operations
  const handleAssignVehicle = async (vehicleId: string) => {
    if (!selectedBooking) return;
    const selectedVeh = vehicles.find(v => v.id === vehicleId);
    if (!selectedVeh) return;

    try {
      const auditLog = [
        ...(selectedBooking.audit_trail || []),
        {
          action: "vehicle_assigned",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: `Assigned vehicle: ${selectedVeh.brand} ${selectedVeh.model} (${selectedVeh.registration_number})`
        }
      ];

      await supabase
        .from("bookings")
        .update({ 
          vehicle_id: vehicleId,
          assigned_vehicle_reg: selectedVeh.registration_number,
          audit_trail: auditLog
        })
        .eq("id", selectedBooking.id);

      fetchBookingsAndVehicles();
    } catch (err) {
      console.error("Vehicle assignment error:", err);
    }
  };

  const handleChecklistToggle = async (key: "cleaning" | "fuel" | "inspection", val: boolean) => {
    if (!selectedBooking) return;
    const currentChecklist = selectedBooking.preparation_checklist || { cleaning: false, fuel: false, inspection: false };
    const updatedChecklist = { ...currentChecklist, [key]: val };

    try {
      await supabase
        .from("bookings")
        .update({ preparation_checklist: updatedChecklist })
        .eq("id", selectedBooking.id);

      fetchBookingsAndVehicles();
    } catch (err) {
      console.error("Checklist toggle failed:", err);
    }
  };

  const handleRefund = async () => {
    if (!selectedBooking) return;
    if (!confirm("Confirm refund clearance dispatch for this customer deposit?")) return;

    try {
      const auditLog = [
        ...(selectedBooking.audit_trail || []),
        {
          action: "deposit_refunded",
          timestamp: new Date().toISOString(),
          verifier: "Finance Desk",
          note: `Refund processed for INR ${selectedBooking.deposit_amount}`
        }
      ];

      await supabase
        .from("bookings")
        .update({ 
          payment_status: "refunded",
          audit_trail: auditLog
        })
        .eq("id", selectedBooking.id);

      alert("Refund dispatch logged successfully.");
      fetchBookingsAndVehicles();
    } catch (err) {
      console.error("Refund failed:", err);
    }
  };

  const handleAddNote = async () => {
    if (!selectedBooking || !noteText) return;
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

      await supabase
        .from("bookings")
        .update({ 
          internal_notes: selectedBooking.internal_notes ? `${selectedBooking.internal_notes}\n[Audit]: ${noteText}` : noteText,
          audit_trail: auditLog
        })
        .eq("id", selectedBooking.id);

      setNoteText("");
      fetchBookingsAndVehicles();
      alert("Note added to operational audit log.");

    } catch (err) {
      console.error("Add note failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
    `${b.user?.first_name} ${b.user?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (b.vehicle?.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center glass-card glass-glow-blue p-6">
        <div>
          <span className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-widest block mb-1">Prestige Control Center</span>
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
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 w-full md:w-56"
            />
          </div>

          {/* Dual View Toggler */}
          <div className="flex bg-[#090a0f] border border-white/10 p-0.5 rounded-xl">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === "kanban" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" /> Kanban
            </button>
            <button 
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === "timeline" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-white/30 font-mono">Connecting operational nodes...</div>
      ) : (
        <>
          {/* ─── KANBAN BOARD VIEW ─── */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4 custom-scrollbar">
              {STAGES.map(stage => {
                const stageBookings = filteredBookings.filter(b => b.booking_status === stage.id);
                return (
                  <div 
                    key={stage.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                    className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 space-y-4 min-h-[500px] flex flex-col shrink-0 w-64 md:w-auto"
                  >
                    {/* Swimlane header */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">{stage.label}</span>
                      <span className="bg-[#090a0f] border border-white/10 text-white/60 font-mono text-[9px] px-1.5 py-0.5 rounded">
                        {stageBookings.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3 flex-1">
                      {stageBookings.map(b => (
                        <div
                          key={b.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, b.id)}
                          onClick={() => setSelectedId(b.id)}
                          className="p-4 rounded-xl border border-white/5 bg-[#090a0f]/60 hover:border-blue-500/20 hover:shadow-[0_4px_20px_rgba(59,130,246,0.05)] cursor-grab active:cursor-grabbing transition-all text-left space-y-2.5"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-white/40">#{b.booking_reference}</span>
                            <span className="text-[8px] bg-white/5 border border-white/10 text-white/50 px-1 rounded uppercase">
                              {b.pickup_method || "Office"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-white text-xs font-bold leading-snug">{b.user?.first_name} {b.user?.last_name}</h4>
                            <p className="text-white/40 text-[10px] mt-0.5">
                              {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "Pending Assignment"}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[8px] font-mono text-white/30 border-t border-white/5 pt-2">
                            <span>{new Date(b.pickup_datetime).toLocaleDateString()}</span>
                            <span>{b.payment_status}</span>
                          </div>
                        </div>
                      ))}
                      
                      {stageBookings.length === 0 && (
                        <div className="h-32 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-[10px] text-white/20">
                          Drop bookings here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── CALENDAR TIMELINE VIEW ─── */}
          {viewMode === "timeline" && (
            <div className="bg-[#0f1115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header (Days) */}
              <div className="flex border-b border-white/10 bg-white/5">
                <div className="w-64 shrink-0 border-r border-white/10 p-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">Fleet ({vehicles.length})</span>
                  <SlidersHorizontal className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1 grid grid-cols-7">
                  {timelineDays.map((day, i) => (
                    <div key={i} className={`p-4 border-r border-white/5 text-center ${i === 0 ? 'bg-blue-500/10' : ''}`}>
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${i === 0 ? 'text-[#3B82F6]' : 'text-white/40'}`}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-xl font-black ${i === 0 ? 'text-[#3B82F6]' : 'text-white'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {vehicles.map(vehicle => {
                  const vehBookings = filteredBookings.filter(b => b.vehicle_id === vehicle.id);
                  return (
                    <div key={vehicle.id} className="flex min-h-[5rem]">
                      {/* Vehicle details */}
                      <div className="w-64 shrink-0 border-r border-white/10 p-4 bg-white/[0.01]">
                        <h4 className="text-white text-sm font-bold">{vehicle.brand} {vehicle.model}</h4>
                        <p className="text-white/40 text-[10px] uppercase mt-0.5">{vehicle.registration_number}</p>
                      </div>

                      {/* Timeline Slots */}
                      <div className="flex-1 grid grid-cols-7 relative">
                        {timelineDays.map((day, idx) => {
                          // Check if any booking falls on this day for this vehicle
                          const bookingOnDay = vehBookings.find(b => {
                            const bStart = new Date(b.pickup_datetime);
                            const bEnd = new Date(b.return_datetime);
                            return day >= startOfToday() && day >= bStart && day <= bEnd;
                          });

                          return (
                            <div 
                              key={idx} 
                              onClick={() => bookingOnDay && setSelectedId(bookingOnDay.id)}
                              className={`border-r border-white/5 p-2 flex flex-col justify-between transition-all ${
                                bookingOnDay ? "bg-blue-600/10 hover:bg-blue-600/20 cursor-pointer" : ""
                              }`}
                            >
                              {bookingOnDay ? (
                                <>
                                  <span className="text-white text-[10px] font-bold truncate block">
                                    {bookingOnDay.user?.first_name} {bookingOnDay.user?.last_name}
                                  </span>
                                  <span className="text-[8px] text-blue-400 font-mono truncate uppercase block mt-1">
                                    #{bookingOnDay.booking_reference}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[9px] text-white/5 italic">Available</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Detail Drawer / Sidebar ─── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          
          {/* Panel */}
          <div className="w-full max-w-lg bg-[#0c0d10] border-l border-white/10 h-full relative z-10 flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar">
            
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] font-mono text-white/40 uppercase">Reference Docket: #{selectedBooking.booking_reference}</span>
                  <h3 className="text-white text-xl font-extrabold" style={{ fontFamily: "var(--font-urbanist)" }}>Onboarding Checkout</h3>
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
                    {selectedBooking.user?.first_name[0]}{selectedBooking.user?.last_name[0]}
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">{selectedBooking.user?.first_name} {selectedBooking.user?.last_name}</h4>
                    <p className="text-white/40 text-xs mt-0.5">{selectedBooking.user?.email} | {selectedBooking.user?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Assignment */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Vehicle Assignment</span>
                <div className="space-y-2">
                  <select
                    value={selectedBooking.vehicle_id || ""}
                    onChange={(e) => handleAssignVehicle(e.target.value)}
                    className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">Assign vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.registration_number})</option>
                    ))}
                  </select>

                  {selectedBooking.assigned_vehicle_reg && (
                    <div className="flex justify-between items-center text-xs bg-blue-600/10 border border-blue-500/20 p-2.5 rounded-lg text-blue-300">
                      <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Registry Match:</span>
                      <span className="font-mono font-bold uppercase">{selectedBooking.assigned_vehicle_reg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preparation Checklist */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Preparation Checklist</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#090a0f]/40 border border-white/5 text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBooking.preparation_checklist?.cleaning || false}
                      onChange={(e) => handleChecklistToggle("cleaning", e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0"
                    />
                    <span>Detalled Cleaning</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#090a0f]/40 border border-white/5 text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBooking.preparation_checklist?.fuel || false}
                      onChange={(e) => handleChecklistToggle("fuel", e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0"
                    />
                    <span>Refuel check</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#090a0f]/40 border border-white/5 text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBooking.preparation_checklist?.inspection || false}
                      onChange={(e) => handleChecklistToggle("inspection", e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0"
                    />
                    <span>Safety Check</span>
                  </label>
                </div>
              </div>

              {/* Financial logs & Deposit */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Financial Audit Logs</span>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#090a0f] p-3 rounded-lg border border-white/5 text-left">
                    <span className="text-white/40 block text-[9px] uppercase">Grand Total</span>
                    <span className="text-white font-mono font-extrabold text-sm mt-0.5 block">{formatINR(selectedBooking.total_amount)}</span>
                  </div>
                  <div className="bg-[#090a0f] p-3 rounded-lg border border-white/5 text-left">
                    <span className="text-white/40 block text-[9px] uppercase">Security Deposit</span>
                    <span className="text-white font-mono font-extrabold text-sm mt-0.5 block">{formatINR(selectedBooking.deposit_amount)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">Payment Status:</span>
                  <span className="text-white font-bold uppercase">{selectedBooking.payment_status}</span>
                </div>

                {selectedBooking.payment_status === "paid" && (
                  <button
                    onClick={handleRefund}
                    className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold text-[10px] uppercase rounded-xl py-3 tracking-widest transition-colors cursor-pointer"
                  >
                    Initiate Refund Dispatch
                  </button>
                )}
              </div>

              {/* Internal Notes & Audits */}
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Audit Log Comments</span>
                
                <div className="bg-[#090a0f] p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto text-xs text-white/60 font-mono whitespace-pre-line leading-relaxed">
                  {selectedBooking.internal_notes || "No notes configured."}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add comment note to audit trail..."
                    className="flex-1 bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none"
                  />
                  <Button 
                    onClick={handleAddNote}
                    disabled={submitting} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs uppercase font-bold"
                  >
                    Add
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
