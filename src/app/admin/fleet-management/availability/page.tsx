"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Info,
  Wrench,
  Clock
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  availability_status: string;
  blocked_dates?: string[];
  maintenance?: any[];
}

export default function AvailabilityCalendarPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Manual block form states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockReason, setBlockReason] = useState("blocked"); // blocked, maintenance, reserved, available

  // Calendar render states
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed = 6)

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (res.ok && data.vehicles) {
        setVehicles(data.vehicles);
        if (data.vehicles.length > 0) {
          const first = data.vehicles[0];
          setSelectedVehicleId(first.id);
          setBlockedDates(first.blocked_dates || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      setBlockedDates(vehicle.blocked_dates || []);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Toggle single date status
  const handleDateClick = (dateStr: string) => {
    let nextBlocked;
    if (blockedDates.includes(dateStr)) {
      nextBlocked = blockedDates.filter(d => d !== dateStr);
    } else {
      nextBlocked = [...blockedDates, dateStr];
    }
    setBlockedDates(nextBlocked);
  };

  // Handle range blocking
  const handleRangeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const list: string[] = [];

    // Loop through date range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      list.push(dateStr);
    }

    let nextBlocked = [...blockedDates];
    if (blockReason === "available") {
      // Remove these dates from blocked dates
      nextBlocked = nextBlocked.filter(d => !list.includes(d));
    } else {
      // Add and ensure uniqueness
      nextBlocked = Array.from(new Set([...nextBlocked, ...list]));
    }

    setBlockedDates(nextBlocked);
    setStartDate("");
    setEndDate("");
  };

  const handleSaveCalendar = async () => {
    if (!selectedVehicleId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedVehicleId,
          blocked_dates: blockedDates
        })
      });
      if (res.ok) {
        setVehicles(vehicles.map(v => v.id === selectedVehicleId ? { ...v, blocked_dates: blockedDates } : v));
        alert("Availability calendar updated and synced successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Generate calendar days list
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarDays = [];

  // Padding days from previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }

  // Days of current month
  for (let i = 1; i <= totalDays; i++) {
    const dayStr = String(i).padStart(2, "0");
    const monthStr = String(currentMonth + 1).padStart(2, "0");
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    calendarDays.push(dateStr);
  }

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Dispatch Operations
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Availability Calendar
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Set blocked intervals, schedule rentals, and block service maintenance dates.
          </p>
        </div>

        <Button variant="fleet" size="sm" onClick={handleSaveCalendar} disabled={saving || !selectedVehicleId}>
          <Check className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Calendar Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Control Card */}
        <div className="space-y-6">
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Select Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="glass-input px-3.5 py-2.5 text-white bg-transparent border border-white/10 rounded-xl focus:outline-none"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-[#0f1115]">
                    {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/5 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/35" />
                <span>Available Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-blue-500/20 border border-blue-500/35" />
                <span>Reserved / Rented</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/35" />
                <span>Maintenance / Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-red-500/20 border border-red-500/35" />
                <span>Manually Blocked</span>
              </div>
            </div>
          </GlassCard>

          {/* Range Blocker Form */}
          <GlassCard className="p-5">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 600, color: "#ffffff", marginBottom: "1rem" }} className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" /> Manual Date Blocker
            </h3>

            <form onSubmit={handleRangeBlock} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input px-3.5 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input px-3.5 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Action Status</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="glass-input px-3 py-2 text-white text-xs bg-transparent border border-white/10 rounded-xl focus:outline-none"
                >
                  <option value="blocked" className="bg-[#0f1115]">Block dates</option>
                  <option value="available" className="bg-[#0f1115]">Unblock (make available)</option>
                </select>
              </div>

              <Button variant="secondary" type="submit" size="sm" className="w-full">
                Apply Action
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Calendar visual */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-[#00e5ff] shrink-0 border border-cyan-500/20">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff" }}>
                  {monthNames[currentMonth]} {currentYear}
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs"
                >
                  Next Month
                </button>
              </div>
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-white/35 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dateStr, index) => {
                if (!dateStr) {
                  return <div key={`empty-${index}`} className="h-16 rounded-xl bg-white/[0.01] opacity-20" />;
                }

                const dayNum = dateStr.split("-")[2];
                const isBlocked = blockedDates.includes(dateStr);
                
                // Demo booked reservation logic
                const isBooked = !isBlocked && Number(dayNum) >= 12 && Number(dayNum) <= 16;
                const isMaintenance = !isBlocked && !isBooked && Number(dayNum) === 22;

                let tileClass = "border-white/10 bg-white/[0.02] text-white/80 hover:bg-white/[0.06]";
                let statusLabel = "Available";
                
                if (isBlocked) {
                  tileClass = "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15";
                  statusLabel = "Blocked";
                } else if (isBooked) {
                  tileClass = "bg-blue-500/10 border-blue-500/30 text-blue-400";
                  statusLabel = "Reserved";
                } else if (isMaintenance) {
                  tileClass = "bg-amber-500/10 border-amber-500/30 text-amber-400";
                  statusLabel = "Service";
                }

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    className={`h-16 border rounded-xl flex flex-col justify-between p-2 cursor-pointer transition-all select-none ${tileClass}`}
                  >
                    <span className="font-mono text-xs">{Number(dayNum)}</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider block opacity-60 text-left">
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-3 text-xs text-white/50">
              <Info className="w-4 h-4 text-[#00e5ff] shrink-0 mt-0.5" />
              <p>
                Click on any calendar day to quickly toggle its availability between <strong>Available</strong> and <strong>Blocked</strong>. Save your changes at the top right to push updates to the live reservation page.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
