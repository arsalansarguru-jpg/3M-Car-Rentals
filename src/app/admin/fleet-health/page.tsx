"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SummaryStats {
  avgHealth: number;
  totalFASTag: number;
  nonCompliantCount: number;
  maintenanceCount: number;
  dirtyCount: number;
  detailingCount: number;
  totalVehicles: number;
}

interface FleetHealthAlert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  text: string;
  dueDate?: string;
  vehicleName?: string;
  registrationNumber?: string;
}

interface MaintenancePrediction {
  nextOilChangeKmRemaining: number;
  nextOilChangeDate: string;
  nextServiceKmRemaining: number;
  nextServiceDate: string;
  tyreReplacementKmRemaining: number;
  batteryReplacementDate: string;
  optimalServiceDate: string;
  optimalServiceReason: string;
}

interface VehicleHealthStatus {
  vehicleId: string;
  brand: string;
  model: string;
  registrationNumber: string;
  availabilityStatus: string;
  
  insuranceExpiry: string;
  rcExpiry: string;
  pucExpiry: string;
  isCompliant: boolean;
  
  fastagBalance: number;
  currentOdometer: number;
  lastServiceDate: string;
  nextServiceDate: string;
  lastServiceOdometer: number;
  lastOilChangeDate: string;
  lastOilChangeOdometer: number;
  nextOilChangeOdometer: number;
  tyreTreadDepthMm: number;
  tyreInstallDate: string;
  tyreAlignmentDate: string;
  batteryHealthPct: number;
  batteryInstallDate: string;
  batteryVoltage: number;
  
  cleanlinessScore: number;
  cleanlinessStatus: "Clean" | "Dirty" | "Detailing";
  activeDamagesCount: number;
  activeAccidentsCount: number;
  
  healthScore: number;
  alerts: FleetHealthAlert[];
  predictions: MaintenancePrediction;
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FleetHealthPage() {
  const router = useRouter();
  
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{
    summary: SummaryStats;
    vehicles: VehicleHealthStatus[];
    alerts: FleetHealthAlert[];
  } | null>(null);
  
  const [activeTab, setActiveTab] = React.useState<"monitor" | "compliance" | "predictions" | "incidents">("monitor");
  const [selectedVehicle, setSelectedVehicle] = React.useState<VehicleHealthStatus | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [submittingService, setSubmittingService] = React.useState(false);
  
  // Service Log Form state
  const [serviceType, setServiceType] = React.useState("scheduled_service");
  const [serviceCost, setServiceCost] = React.useState("4500");
  const [serviceOdo, setServiceOdo] = React.useState("");
  const [serviceDetails, setServiceDetails] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/fleet-health/dashboard");
      if (res.status === 401) {
        router.replace("/login?redirect=/admin/fleet-health");
        return;
      }
      const json = await res.json();
      setTimeout(() => {
        setData(json);
        setLoading(false);
      }, 0);
    } catch (err) {
      console.error("Failed to load fleet health dashboard:", err);
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [router]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenServiceModal = (v: VehicleHealthStatus) => {
    setSelectedVehicle(v);
    setServiceOdo(String(v.currentOdometer));
    setServiceType("scheduled_service");
    setServiceCost("4500");
    setServiceDetails("");
    setFormError(null);
    setIsServiceModalOpen(true);
  };

  const handleRecordService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setFormError(null);

    if (!serviceOdo || Number(serviceOdo) < selectedVehicle.currentOdometer) {
      setFormError(`Odometer must be equal or greater than the current value: ${selectedVehicle.currentOdometer} km`);
      return;
    }

    setSubmittingService(true);
    try {
      const res = await fetch("/api/fleet-health/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle.vehicleId,
          serviceType,
          cost: Number(serviceCost),
          odometer: Number(serviceOdo),
          details: serviceDetails
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to record service.");
      } else {
        setIsServiceModalOpen(false);
        fetchDashboardData();
      }
    } catch {
      setFormError("Connection error. Please try again.");
    } finally {
      setSubmittingService(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.06] pb-6">
        <div>
          <p className="text-[#3B82F6] text-[10px] font-mono tracking-widest uppercase mb-1">Fleet Operations</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl tracking-tight leading-none">AI Fleet Health Center</h1>
          <p className="text-white/40 text-sm mt-2">Compliance checks, component diagnostics, FASTag flow, and wear forecasts.</p>
        </div>
        <Link 
          href="/admin" 
          className="px-5 py-2.5 rounded-xl text-xs font-bold border border-white/10 text-white hover:bg-white/5 transition-all text-center"
        >
          Return to Command Room
        </Link>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.02] border border-white/[0.08]" />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-white/[0.02] border border-white/[0.08] animate-pulse" />
        </div>
      ) : !data ? (
        <div className="text-center p-12 bg-white/[0.01] rounded-2xl border border-white/[0.08]">
          <p className="text-white/40">Failed to initialize fleet health records.</p>
        </div>
      ) : (
        <>
          {/* ── Summary KPIs Strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase font-semibold">Avg Health Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data.summary.avgHealth}%</span>
                <span className="text-[9px] font-bold text-emerald-400">Optimal</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase font-semibold">Total FASTag Pool</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{formatINR(data.summary.totalFASTag)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase font-semibold">Non-Compliant</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${data.summary.nonCompliantCount > 0 ? "text-red-400" : "text-white"}`}>
                  {data.summary.nonCompliantCount}
                </span>
                <span className="text-[9px] text-white/30">due to expiry</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col justify-between">
              <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase font-semibold">In Maintenance</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data.summary.maintenanceCount}</span>
                <span className="text-[9px] text-white/30">cars offline</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase font-semibold">Needs Detailing</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {data.summary.dirtyCount + data.summary.detailingCount}
                </span>
                <span className="text-[9px] text-white/30">dirty / detailing</span>
              </div>
            </div>
          </div>

          {/* ── Active Health Warnings Banner ── */}
          {data.alerts.length > 0 && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.03] space-y-2">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-2">
                <span>⚠️</span> Active Maintenance & Compliance Alerts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {data.alerts.slice(0, 6).map((alt) => (
                  <div key={alt.id} className="p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white/90">{alt.vehicleName} ({alt.registrationNumber})</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${alt.type === "error" ? "bg-red-400/20 text-red-400 border border-red-500/30" : "bg-yellow-400/20 text-yellow-400 border border-yellow-500/30"}`}>
                        {alt.type}
                      </span>
                    </div>
                    <p className="text-white/40 text-[11px] font-medium leading-normal">{alt.title}: {alt.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Interactive Tabs Nav ── */}
          <div className="flex border-b border-white/10 gap-2">
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "monitor" ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              Health Monitor
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "compliance" ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              Document Compliance
            </button>
            <button
              onClick={() => setActiveTab("predictions")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "predictions" ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              AI Wear Predictions
            </button>
            <button
              onClick={() => setActiveTab("incidents")}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === "incidents" ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              Incidents Logs
            </button>
          </div>

          {/* ── Sub-dashboard Views ── */}
          <div className="space-y-6">
            {/* VIEW 1: HEALTH MONITOR */}
            {activeTab === "monitor" && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4 font-bold text-white/40 uppercase tracking-wider">Vehicle</th>
                        <th className="p-4 font-bold text-white/40 uppercase tracking-wider">Health</th>
                        <th className="p-4 font-bold text-white/40 uppercase tracking-wider">Cleanliness</th>
                        <th className="p-4 font-bold text-white/40 uppercase tracking-wider">Odometer</th>
                        <th className="p-4 font-bold text-white/40 uppercase tracking-wider">FASTag Balance</th>
                        <th className="p-4 font-bold text-white/40 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.vehicles.map((v) => (
                        <tr key={v.vehicleId} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{v.brand} {v.model}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{v.registrationNumber}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${v.healthScore > 80 ? "bg-emerald-400" : v.healthScore > 50 ? "bg-yellow-400" : "bg-red-400"}`} />
                              <span className="font-bold text-white">{v.healthScore}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.cleanlinessStatus === "Clean" ? "bg-emerald-400/10 text-emerald-400" : v.cleanlinessStatus === "Dirty" ? "bg-red-400/10 text-red-400" : "bg-blue-400/10 text-blue-400"}`}>
                              {v.cleanlinessStatus}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-medium text-white">{v.currentOdometer.toLocaleString()} km</td>
                          <td className="p-4 font-mono font-medium text-white">₹{v.fastagBalance.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenServiceModal(v)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-all cursor-pointer"
                            >
                              ⚙️ Record Service
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 2: DOCUMENT COMPLIANCE */}
            {activeTab === "compliance" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.vehicles.map((v) => {
                  const checkNow = new Date();
                  const insExpired = new Date(v.insuranceExpiry) < checkNow;
                  const pucExpired = new Date(v.pucExpiry) < checkNow;
                  const rcExpired = new Date(v.rcExpiry) < checkNow;

                  return (
                    <div key={v.vehicleId} className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4">
                      <div>
                        <h4 className="font-bold text-white">{v.brand} {v.model}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{v.registrationNumber}</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40 font-medium">Insurance Expiry</span>
                          <span className={`font-semibold ${insExpired ? "text-red-400" : "text-emerald-400"}`}>
                            {v.insuranceExpiry} {insExpired && "⚠️"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40 font-medium">PUC Expiry</span>
                          <span className={`font-semibold ${pucExpired ? "text-red-400" : "text-emerald-400"}`}>
                            {v.pucExpiry} {pucExpired && "⚠️"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-white/40 font-medium">RC Expiry</span>
                          <span className={`font-semibold ${rcExpired ? "text-red-400" : "text-emerald-400"}`}>
                            {v.rcExpiry} {rcExpired && "⚠️"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className={`w-full block text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${v.isCompliant ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {v.isCompliant ? "✅ Compliant (Eligible)" : "🛑 Non-Compliant (Blocked)"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 3: AI WEAR PREDICTIONS */}
            {activeTab === "predictions" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {data.vehicles.map((v) => (
                  <div key={v.vehicleId} className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-white">{v.brand} {v.model}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{v.registrationNumber}</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/40 font-medium">Tyre Tread Depth</span>
                          <span className={`font-semibold ${v.tyreTreadDepthMm < 3.0 ? "text-yellow-400" : "text-white"}`}>
                            {v.tyreTreadDepthMm.toFixed(1)} mm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 font-medium">Battery Voltage</span>
                          <span className={`font-semibold ${v.batteryVoltage < 12.0 ? "text-yellow-400" : "text-white"}`}>
                            {v.batteryVoltage} V
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 font-medium">Battery Health</span>
                          <span className="font-semibold text-white">{v.batteryHealthPct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-between text-xs space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between font-mono">
                          <span className="text-white/30 font-semibold uppercase text-[9px]">Next Oil Change</span>
                          <span className="font-semibold text-white">{v.predictions.nextOilChangeKmRemaining.toLocaleString()} km ({v.predictions.nextOilChangeDate})</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-white/30 font-semibold uppercase text-[9px]">Tyres Life</span>
                          <span className="font-semibold text-white">{v.predictions.tyreReplacementKmRemaining.toLocaleString()} km</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span className="text-white/30 font-semibold uppercase text-[9px]">Scheduled Service</span>
                          <span className="font-semibold text-white">{v.predictions.nextServiceDate}</span>
                        </div>
                      </div>

                      <div className="border-t border-white/[0.06] pt-3 space-y-1">
                        <div className="text-[9px] text-[#3B82F6] font-black uppercase tracking-wider font-mono">Recommended Service Target</div>
                        <p className="text-white/40 text-[11px] leading-relaxed font-semibold">
                          {v.predictions.optimalServiceDate} · {v.predictions.optimalServiceReason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 4: INCIDENTS LOGS */}
            {activeTab === "incidents" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5">
                  <h3 className="text-white font-black text-base mb-4 font-sans">Accident & Active Damage History</h3>
                  <div className="space-y-4 text-xs">
                    {data.vehicles.filter((v) => v.activeDamagesCount > 0 || v.activeAccidentsCount > 0).length === 0 ? (
                      <p className="text-center text-white/30 py-8 font-semibold">No unresolved accidents or active damages logged.</p>
                    ) : (
                      data.vehicles.map((v) => {
                        if (v.activeDamagesCount === 0 && v.activeAccidentsCount === 0) return null;
                        return (
                          <div key={v.vehicleId} className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="font-bold text-white">{v.brand} {v.model} ({v.registrationNumber})</div>
                              <p className="text-white/40 text-[11px] mt-1 leading-normal font-semibold">
                                Car currently has active issues flagged. Total active accidents: {v.activeAccidentsCount}, active damages: {v.activeDamagesCount}.
                              </p>
                            </div>
                            <span className="text-xs uppercase font-black px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                              Active Repair Required
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Record Service Modal Overlay ── */}
          {isServiceModalOpen && selectedVehicle && (
            <div className="fixed inset-0 bg-[#0a0b0d]/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
              <div className="max-w-md w-full bg-[#0f1115] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white font-sans">Record Maintenance Service</h3>
                  <p className="text-white/40 text-xs font-semibold mt-1">Vehicle: {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.registrationNumber})</p>
                </div>

                <form onSubmit={handleRecordService} className="space-y-4 text-xs font-sans">
                  {formError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold leading-normal">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Service Category</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3B82F6]"
                    >
                      <option value="scheduled_service" className="bg-[#0f1115]">Scheduled Periodic Service</option>
                      <option value="oil_change" className="bg-[#0f1115]">Engine Oil & Filter Change</option>
                      <option value="tyre_replacement" className="bg-[#0f1115]">Tyres Replacement / Alignment</option>
                      <option value="battery_replacement" className="bg-[#0f1115]">Battery Replacement / Diagnostics</option>
                      <option value="general_repair" className="bg-[#0f1115]">General Mechanical/Body Repair</option>
                      <option value="detailing" className="bg-[#0f1115]">Full Detailing / Cleaning wash</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Odometer (km)</label>
                      <input
                        type="number"
                        value={serviceOdo}
                        onChange={(e) => setServiceOdo(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3B82F6]"
                        placeholder="Current mileage"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Service Cost (₹)</label>
                      <input
                        type="number"
                        value={serviceCost}
                        onChange={(e) => setServiceCost(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3B82F6]"
                        placeholder="Total amount"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Service Details & Notes</label>
                    <textarea
                      value={serviceDetails}
                      onChange={(e) => setServiceDetails(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3B82F6] h-20 resize-none placeholder:text-white/20"
                      placeholder="Specify replaced parts, wear status, etc."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsServiceModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingService}
                      className="flex-1 py-3 rounded-xl bg-[#3B82F6] text-[#0f1115] font-black hover:bg-[#60A5FA] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {submittingService ? "Saving..." : "Save Record"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
