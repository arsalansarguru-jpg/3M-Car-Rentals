"use client";

import React, { useEffect, useState } from "react";
import { 
  Wrench, 
  Plus, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Trash2,
  Check
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  maintenance?: any[];
}

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [logType, setLogType] = useState("General Service");
  const [logCost, setLogCost] = useState("");
  const [logDate, setLogDate] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logStatus, setLogStatus] = useState("completed");

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
          setMaintenanceLogs(first.maintenance || []);
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
      setMaintenanceLogs(vehicle.maintenance || []);
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logCost || !logDate) return;

    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      type: logType,
      cost: Number(logCost),
      date: logDate,
      notes: logNotes,
      status: logStatus
    };

    setMaintenanceLogs([newLog, ...maintenanceLogs]);
    setLogCost("");
    setLogNotes("");
  };

  const handleDeleteLog = (id: string) => {
    setMaintenanceLogs(maintenanceLogs.filter(log => log.id !== id));
  };

  const handleSaveLogs = async () => {
    if (!selectedVehicleId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedVehicleId,
          maintenance: maintenanceLogs
        })
      });
      if (res.ok) {
        setVehicles(vehicles.map(v => v.id === selectedVehicleId ? { ...v, maintenance: maintenanceLogs } : v));
        alert("Maintenance records updated and saved!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Compute total maintenance spent
  const totalSpent = maintenanceLogs.reduce((acc, log) => acc + (log.cost || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Fleet Health & diagnostics
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Maintenance & Service Logs
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Track recurring checklists, service timelines, and maintenance expenditures.
          </p>
        </div>

        <Button variant="fleet" size="sm" onClick={handleSaveLogs} disabled={saving || !selectedVehicleId}>
          <Check className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Maintenance Logs"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          {/* Selector */}
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

            <div className="pt-3 border-t border-white/5 space-y-2 text-sm text-white/60">
              <div className="flex justify-between">
                <span>Lifetime Cost</span>
                <span className="text-white font-mono font-semibold text-emerald-400">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Completed Tasks</span>
                <span className="text-white font-mono">
                  {maintenanceLogs.filter(l => l.status === "completed").length}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* New service log form */}
          <GlassCard className="p-5">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 600, color: "#ffffff", marginBottom: "1rem" }} className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Log Service Action
            </h3>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Service Type</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="glass-input px-3 py-2 text-white text-xs bg-transparent border border-white/10 rounded-xl focus:outline-none"
                >
                  <option value="General Service" className="bg-[#0f1115]">General Service</option>
                  <option value="Oil Change" className="bg-[#0f1115]">Oil Change</option>
                  <option value="Tyre Rotation" className="bg-[#0f1115]">Tyre Rotation</option>
                  <option value="Battery Replacement" className="bg-[#0f1115]">Battery Change</option>
                  <option value="Unexpected Repair" className="bg-[#0f1115]">Unexpected Repair</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Cost (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={logCost}
                  onChange={(e) => setLogCost(e.target.value)}
                  className="glass-input px-3.5 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date of Service</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="glass-input px-3.5 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Notes / Details</label>
                <textarea
                  placeholder="Replaced filters, checked coolant level"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  rows={2}
                  className="glass-input p-3 text-white text-xs focus:outline-none resize-none"
                />
              </div>

              <Button variant="secondary" type="submit" size="sm" className="w-full">
                Add Log Entry
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Timeline displays */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick checklist statuses */}
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.25rem" }}>
              Component Checklist Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Engine Oil</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 600, color: "#10b981", marginTop: "0.2rem" }} className="block">Optimal</span>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Tyre Wear</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 600, color: "#f59e0b", marginTop: "0.2rem" }} className="block">Replace soon (85%)</span>
                </div>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Battery health</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 600, color: "#10b981", marginTop: "0.2rem" }} className="block">Good (92%)</span>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </GlassCard>

          {/* Timeline list */}
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.5rem" }}>
              Service History timeline
            </h3>

            {maintenanceLogs.length === 0 ? (
              <div className="py-14 text-center text-white/35 flex flex-col items-center gap-2">
                <Wrench className="w-8 h-8 text-white/10" />
                <p>No service history recorded for this unit.</p>
              </div>
            ) : (
              <div className="relative before:absolute before:inset-y-0 before:left-4 before:translate-x-0.5 before:w-0.5 before:bg-white/10 space-y-6 pl-10">
                {maintenanceLogs.map((log, idx) => (
                  <div key={log.id || idx} className="relative flex flex-col gap-1 items-start">
                    {/* Circle marker */}
                    <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-[#0f1115] border-2 border-[#00e5ff] z-10" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff" }}>
                          {log.type}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          {log.status}
                        </span>
                      </div>

                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }} className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {log.date}
                      </span>
                    </div>

                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", marginTop: "0.2rem" }}>
                      {log.notes || "No details provided."}
                    </p>

                    <div className="flex items-center justify-between w-full mt-2.5 pt-2 border-t border-white/[0.03] text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
                        <DollarSign className="w-3.5 h-3.5" /> Cost: ₹{log.cost.toLocaleString("en-IN")}
                      </div>

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-white/30 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-all"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
