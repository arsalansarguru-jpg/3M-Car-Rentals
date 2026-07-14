"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Sparkles, 
  Car, 
  X,
  RefreshCw,
  PhoneCall,
  User,
  ArrowRight
} from "lucide-react";

interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  vehicle_id: string | null;
  pickup_datetime: string;
  return_datetime: string;
  booking_status: string;
  pickup_method?: string | null;
  user: {
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    registration_number: string;
  } | null;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  availability_status: string;
}

interface Health {
  vehicle_id: string;
  cleanliness_status: string;
  current_odometer: number;
}

interface OperationsCommandCenterClientProps {
  initialBookings: Booking[];
  initialVehicles: Vehicle[];
  initialHealth: Health[];
}

export default function OperationsCommandCenterClient({ initialBookings, initialVehicles, initialHealth }: OperationsCommandCenterClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [healths, setHealths] = useState<Health[]>(initialHealth);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Operations metrics sync
  const fetchLatestOperationsData = async () => {
    setIsRefreshing(true);
    try {
      const { data: bData } = await supabase
        .from("bookings")
        .select(`
          *,
          user:users(first_name, last_name, phone),
          vehicle:vehicles(id, brand, model, registration_number)
        `)
        .order("pickup_datetime", { ascending: true });
      if (bData) setBookings(bData as any);

      const { data: vData } = await supabase
        .from("vehicles")
        .select("id, brand, model, registration_number, availability_status");
      if (vData) setVehicles(vData as any);

      const { data: hData } = await supabase
        .from("vehicle_health")
        .select("vehicle_id, cleanliness_status, current_odometer");
      if (hData) setHealths(hData as any);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("[Operations Console] Live data sync error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh timer every 30 seconds (optimized for wall displays)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestOperationsData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Operational Actions ---
  // Dispatch a vehicle (Mark active, set vehicle reserved)
  const handleDispatchTrip = async (bookingId: string, vehicleId: string) => {
    try {
      const { error: bErr } = await supabase
        .from("bookings")
        .update({ booking_status: "active" })
        .eq("id", bookingId);
      if (bErr) throw bErr;

      const { error: vErr } = await supabase
        .from("vehicles")
        .update({ availability_status: "reserved" })
        .eq("id", vehicleId);
      if (vErr) throw vErr;

      fetchLatestOperationsData();
      alert("Vehicle dispatch cleared. Trip marked active.");
    } catch (err) {
      console.error("Dispatch error:", err);
    }
  };

  // Complete a Trip (Check in vehicle, mark completed, set vehicle available, set detailing required)
  const handleCheckInReturn = async (bookingId: string, vehicleId: string) => {
    try {
      const { error: bErr } = await supabase
        .from("bookings")
        .update({ booking_status: "completed" })
        .eq("id", bookingId);
      if (bErr) throw bErr;

      // Force detailing/detailing requirements
      const { error: vErr } = await supabase
        .from("vehicles")
        .update({ availability_status: "available" })
        .eq("id", vehicleId);
      if (vErr) throw vErr;

      const { error: hErr } = await supabase
        .from("vehicle_health")
        .update({ cleanliness_status: "Detailing" })
        .eq("vehicle_id", vehicleId);
      if (hErr) throw hErr;

      fetchLatestOperationsData();
      alert("Vehicle checked in successfully. Detailing queue entry logged.");
    } catch (err) {
      console.error("Return check in error:", err);
    }
  };

  // Clear detailing (Mark clean)
  const handleClearDetailing = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from("vehicle_health")
        .update({ cleanliness_status: "Clean" })
        .eq("vehicle_id", vehicleId);
      if (error) throw error;
      fetchLatestOperationsData();
      alert("Detailing complete. Vehicle marked clean.");
    } catch (err) {
      console.error("Clear detailing failed:", err);
    }
  };

  // Filters for Swimlanes
  const readyForPickupBookings = bookings.filter(b => b.booking_status === "confirmed" || b.booking_status === "ready_for_pickup");
  const activeTripsBookings = bookings.filter(b => b.booking_status === "active");

  const todayStr = new Date().toDateString();
  const returnsDueToday = bookings.filter(b => 
    b.booking_status === "active" && 
    b.return_datetime && new Date(b.return_datetime).toDateString() === todayStr
  );

  // Dirty or Detailing vehicles
  const detailingVehicles = vehicles.filter(v => {
    const h = healths.find(health => health.vehicle_id === v.id);
    return h?.cleanliness_status === "Dirty" || h?.cleanliness_status === "Detailing";
  });

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-widest block mb-1">Wall Display Console</span>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Operations Command</h1>
          <p className="text-white/40 text-xs mt-1">Real-time dispatch tracks, cleaning slots, and checkout operations.</p>
        </div>

        {/* Live indicator & manual refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#090a0f] border border-white/10 px-3.5 py-1.5 rounded-xl text-xs text-white/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
            <span className="font-bold uppercase tracking-wider text-[10px] text-white">Live Monitor</span>
          </div>
          
          <button
            onClick={fetchLatestOperationsData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">
            Last Sync: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ─── SWIMLANES DISPATCH GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        
        {/* Lane 1: Ready for Pickup */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-5 space-y-4 backdrop-blur-xl min-h-[550px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#3B82F6] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Ready for Pickup</span>
            <span className="bg-[#090a0f] border border-white/10 text-white/60 font-mono text-[9px] px-2 py-0.5 rounded-lg">
              {readyForPickupBookings.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyForPickupBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl border border-white/5 bg-[#090a0f]/60 space-y-3 relative hover:border-blue-500/20 transition-all text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-mono text-[#3B82F6] font-bold">#{b.booking_reference}</span>
                  <span className="text-[8px] bg-white/5 border border-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase">
                    {b.pickup_method || "Office"}
                  </span>
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold">{b.user?.first_name} {b.user?.last_name}</h4>
                  <span className="text-[9px] text-white/40 block mt-0.5 flex items-center gap-1"><PhoneCall className="w-3 h-3 text-white/20" /> {b.user?.phone}</span>
                </div>
                <div className="border-t border-white/5 pt-2.5 flex items-center justify-between text-[9px] text-white/40 font-mono">
                  <span>Veh: {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "Pending"}</span>
                </div>
                {b.vehicle && (
                  <Button
                    onClick={() => handleDispatchTrip(b.id, b.vehicle!.id)}
                    className="w-full text-[9px] uppercase font-bold py-2 h-auto rounded-xl flex items-center justify-center gap-1"
                  >
                    Clear Dispatch <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            {readyForPickupBookings.length === 0 && (
              <div className="h-32 border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/20 italic">
                No bookings ready in dispatch.
              </div>
            )}
          </div>
        </div>

        {/* Lane 2: Active / On Road */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-5 space-y-4 backdrop-blur-xl min-h-[550px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> Active / On Road</span>
            <span className="bg-[#090a0f] border border-white/10 text-white/60 font-mono text-[9px] px-2 py-0.5 rounded-lg">
              {activeTripsBookings.length}
            </span>
          </div>

          <div className="space-y-3">
            {activeTripsBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl border border-white/5 bg-[#090a0f]/60 space-y-3 relative hover:border-emerald-500/20 transition-all text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-mono text-[#3B82F6] font-bold">#{b.booking_reference}</span>
                  <span className="text-[8px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                    On Road
                  </span>
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold">{b.user?.first_name} {b.user?.last_name}</h4>
                  <span className="text-[9px] text-white/40 block mt-0.5">{b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "Unassigned"}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-[9px] text-white/40 font-mono">
                  <span>Due Return:</span>
                  <span>{new Date(b.return_datetime).toLocaleDateString()}</span>
                </div>
                {b.vehicle && (
                  <Button
                    onClick={() => handleCheckInReturn(b.id, b.vehicle!.id)}
                    variant="outline"
                    className="w-full text-[9px] uppercase font-bold py-2 h-auto rounded-xl flex items-center justify-center gap-1 text-emerald-400 hover:text-white border-emerald-500/20"
                  >
                    Check In / Return
                  </Button>
                )}
              </div>
            ))}
            {activeTripsBookings.length === 0 && (
              <div className="h-32 border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/20 italic">
                No active trips currently on road.
              </div>
            )}
          </div>
        </div>

        {/* Lane 3: Returns Due Today */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-5 space-y-4 backdrop-blur-xl min-h-[550px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Returns Due Today</span>
            <span className="bg-[#090a0f] border border-white/10 text-white/60 font-mono text-[9px] px-2 py-0.5 rounded-lg">
              {returnsDueToday.length}
            </span>
          </div>

          <div className="space-y-3">
            {returnsDueToday.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl border border-white/5 bg-[#090a0f]/60 space-y-3 relative border-amber-500/10 text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-mono text-[#3B82F6] font-bold">#{b.booking_reference}</span>
                  <span className="text-[8.5px] border border-amber-500/20 bg-amber-500/5 text-amber-400 px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
                    Today
                  </span>
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold">{b.user?.first_name} {b.user?.last_name}</h4>
                  <span className="text-[9px] text-white/40 block mt-0.5">{b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "Unassigned"}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-[9px] text-white/40 font-mono">
                  <span>Return Target:</span>
                  <span>{new Date(b.return_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {b.vehicle && (
                  <Button
                    onClick={() => handleCheckInReturn(b.id, b.vehicle!.id)}
                    className="w-full text-[9px] uppercase font-bold py-2 h-auto rounded-xl flex items-center justify-center gap-1"
                  >
                    Check In / Return
                  </Button>
                )}
              </div>
            ))}
            {returnsDueToday.length === 0 && (
              <div className="h-32 border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/20 italic">
                No vehicle returns scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Lane 4: Cleaning & detailing Queue */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-5 space-y-4 backdrop-blur-xl min-h-[550px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Cleaning & Detailing</span>
            <span className="bg-[#090a0f] border border-white/10 text-white/60 font-mono text-[9px] px-2 py-0.5 rounded-lg">
              {detailingVehicles.length}
            </span>
          </div>

          <div className="space-y-3">
            {detailingVehicles.map((v) => {
              const h = healths.find(health => health.vehicle_id === v.id);
              return (
                <div key={v.id} className="p-4 rounded-2xl border border-white/5 bg-[#090a0f]/60 space-y-3 relative hover:border-purple-500/20 transition-all text-left">
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Plate: {v.registration_number}</span>
                    <span className="text-[8px] border border-purple-500/20 bg-purple-500/5 text-purple-400 px-1.5 py-0.5 rounded uppercase">
                      {h?.cleanliness_status || "Dirty"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold">{v.brand} {v.model}</h4>
                    <span className="text-[9px] text-white/40 block mt-0.5 font-mono">Odometer: {h?.current_odometer?.toLocaleString()} KM</span>
                  </div>
                  <Button
                    onClick={() => handleClearDetailing(v.id)}
                    variant="outline"
                    className="w-full text-[9px] uppercase font-bold py-2 h-auto rounded-xl flex items-center justify-center gap-1 text-purple-400 hover:text-white border-purple-500/20 animate-pulse"
                  >
                    Mark Detailing Complete
                  </Button>
                </div>
              );
            })}
            {detailingVehicles.length === 0 && (
              <div className="h-32 border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/20 italic">
                All vehicles clean. Detailing lanes clear.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
