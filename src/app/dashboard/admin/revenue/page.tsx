"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface KpiData {
  expectedRevenue: number;
  potentialRevenue: number;
  lostRevenue: number;
  opportunityRevenue: number;
  idleCost: number;
  leakageRevenue: number;
  adr: number;
  abv: number;
  occupancy: number;
  utilization: number;
  idleVehicles: number;
  topVehicle: string;
  worstVehicle: string;
}

interface ForecastItem {
  tomorrowIndex: number;
  tomorrowConf: number;
  next7DaysIndex: number;
  next7DaysConf: number;
  next30DaysIndex: number;
  next30DaysConf: number;
  next90DaysIndex: number;
  next90DaysConf: number;
}

interface FleetInsight {
  id: string;
  brand: string;
  model: string;
  dailyRate: number;
  status: string;
  utilization: number;
  recommendation: string;
}

interface CustomerSegment {
  userId: string;
  fullName: string;
  email: string;
  segment: string;
  clv: number;
}

interface PromotionRecommendation {
  promoName: string;
  promoCode: string;
  discountPct: number;
  reason: string;
  urgency: string;
}

interface UpgradeSuggestion {
  vehicleId: string;
  brand: string;
  model: string;
  targetUpgradeBrand: string;
  targetUpgradeModel: string;
  probability: number;
  revenueIncrease: number;
}

interface CancellationPrediction {
  bookingId: string;
  bookingRef: string;
  customerName: string;
  riskScore: number;
  recommendation: string;
}

interface MaintenanceSlot {
  vehicleId: string;
  brand: string;
  model: string;
  type: string;
  scheduledDate: string;
  reason: string;
}

interface ExecutiveInsight {
  id: string;
  type: string;
  title: string;
  content: string;
  timestamp: string;
}

interface DiagnosticReportItem {
  name: string;
  type: string;
  status: "passed" | "failed";
  message: string;
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RevenueManagementDashboard() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "analytics" | "operations" | "diagnostics">("overview");
  const [loading, setLoading] = React.useState(true);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [executingIndex, setExecutingIndex] = React.useState<number | null>(null);

  // Payload Stats
  const [kpis, setKpis] = React.useState<KpiData>({
    expectedRevenue: 0,
    potentialRevenue: 0,
    lostRevenue: 0,
    opportunityRevenue: 0,
    idleCost: 0,
    leakageRevenue: 0,
    adr: 0,
    abv: 0,
    occupancy: 74,
    utilization: 68,
    idleVehicles: 0,
    topVehicle: "BMW 3 Series",
    worstVehicle: "Hyundai Creta",
  });

  const [forecast, setForecast] = React.useState<ForecastItem>({
    tomorrowIndex: 65, tomorrowConf: 90,
    next7DaysIndex: 72, next7DaysConf: 85,
    next30DaysIndex: 68, next30DaysConf: 80,
    next90DaysIndex: 58, next90DaysConf: 70,
  });

  const [fleet, setFleet] = React.useState<FleetInsight[]>([]);
  const [customers, setCustomers] = React.useState<CustomerSegment[]>([]);
  const [promotions, setPromotions] = React.useState<PromotionRecommendation[]>([]);
  const [upgrades, setUpgrades] = React.useState<UpgradeSuggestion[]>([]);
  const [cancellations, setCancellations] = React.useState<CancellationPrediction[]>([]);
  const [maintenance, setMaintenance] = React.useState<MaintenanceSlot[]>([]);
  const [insights, setInsights] = React.useState<ExecutiveInsight[]>([]);
  const [recommendations, setRecommendations] = React.useState<string[]>([]);

  // Local Settings States
  const [minOccupancyAlert, setMinOccupancyAlert] = React.useState(40);
  const [maxUtilizationAlert, setMaxUtilizationAlert] = React.useState(95);
  const [idleDaysCap, setIdleDaysCap] = React.useState(10);
  const [alertEmails, setAlertEmails] = React.useState("revenue-alerts@3mrentals.com");
  const [savingSettings, setSavingSettings] = React.useState(false);

  // Diagnostics
  const [testReports, setTestReports] = React.useState<DiagnosticReportItem[]>([]);
  const [runningTests, setRunningTests] = React.useState(false);

  // Initial Fetch Effect
  React.useEffect(() => {
    async function loadRevenueData() {
      try {
        const [dashRes, settingsRes] = await Promise.all([
          fetch("/api/revenue/dashboard"),
          fetch("/api/revenue/settings"),
        ]);

        const dashData = await dashRes.json();
        const settingsData = await settingsRes.json();

        if (dashData.forecast) {
          setForecast(dashData.forecast);
          setFleet(dashData.fleet || []);
          setCustomers(dashData.customers || []);
          setPromotions(dashData.promotions || []);
          setUpgrades(dashData.upgrades || []);
          setCancellations(dashData.cancellations || []);
          setMaintenance(dashData.maintenance || []);
          setInsights(dashData.insights || []);
          setRecommendations(dashData.recommendations || []);

          // Formulate KPI state
          const expected = Number(dashData.financials.expectedRevenue);
          const lost = Number(dashData.financials.lostRevenue);
          const opportunity = Number(dashData.financials.opportunityRevenue);
          const potential = Number(dashData.financials.potentialRevenue);
          const idle = Number(dashData.financials.idleCost);
          const leakage = Number(dashData.financials.leakageRevenue);

          // Get stats from database
          const [bookingsCount] = await Promise.all([
            supabase.from("bookings").select("id", { count: "exact" }),
          ]);

          const totalBookings = bookingsCount.count || 1;

          // Average daily rates
          const { data: vRates } = await supabase.from("vehicles").select("daily_rate");
          const adrValue = vRates && vRates.length > 0
            ? vRates.reduce((s, v) => s + Number(v.daily_rate), 0) / vRates.length
            : 3500;

          // Idle vehicle count
          const idleVehCount = dashData.fleet.filter((f: FleetInsight) => f.status === "idle").length;

          // Get top vehicle by utilization
          const sortedFleet = [...(dashData.fleet || [])].sort((a, b) => b.utilization - a.utilization);
          const topV = sortedFleet.length > 0 ? `${sortedFleet[0].brand} ${sortedFleet[0].model}` : "BMW 3 Series";
          const worstV = sortedFleet.length > 0 ? `${sortedFleet[sortedFleet.length - 1].brand} ${sortedFleet[sortedFleet.length - 1].model}` : "Hyundai Creta";

          setKpis({
            expectedRevenue: expected,
            potentialRevenue: potential,
            lostRevenue: lost,
            opportunityRevenue: opportunity,
            idleCost: idle,
            leakageRevenue: leakage,
            adr: adrValue,
            abv: expected / totalBookings,
            occupancy: 74,
            utilization: 68,
            idleVehicles: idleVehCount,
            topVehicle: topV,
            worstVehicle: worstV,
          });
        }

        if (settingsData.settings) {
          const s = settingsData.settings;
          setMinOccupancyAlert(Number(s.occupancyAlertMin));
          setMaxUtilizationAlert(Number(s.utilizationAlertMax));
          setIdleDaysCap(Number(s.idleDaysThreshold));
          setAlertEmails(s.emailAlertTargets);
        }
      } catch (err) {
        console.error("Failed to load revenue management dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    loadRevenueData();
  }, [refreshTrigger]);

  // Execute Action Recommendation
  const handleExecuteAction = async (idx: number, desc: string) => {
    setExecutingIndex(idx);
    try {
      const res = await fetch("/api/revenue/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionIndex: idx, description: desc }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Action successfully initiated: "${desc}"`);
        setRecommendations((prev) => prev.filter((_, i) => i !== idx));
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert("Failed to execute action: " + data.error);
      }
    } catch {
      alert("Error invoking recommendation worker");
    } finally {
      setExecutingIndex(null);
    }
  };

  // Update Configurations
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setLoading(true);
    try {
      const res = await fetch("/api/revenue/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupancyAlertMin: minOccupancyAlert,
          utilizationAlertMax: maxUtilizationAlert,
          idleDaysThreshold: idleDaysCap,
          emailAlertTargets: alertEmails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Revenue configurations saved successfully!");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert("Failed to save configurations: " + data.error);
        setLoading(false);
      }
    } catch {
      alert("Error updating config params");
      setLoading(false);
    } finally {
      setSavingSettings(false);
    }
  };

  // Run Test Suite
  const handleRunTests = async () => {
    setRunningTests(true);
    try {
      const res = await fetch("/api/revenue/test");
      const data = await res.json();
      if (data.reports) {
        setTestReports(data.reports);
      } else {
        alert("Failed to run diagnostics: " + data.error);
      }
    } catch {
      alert("Error running diagnostics test suite");
    } finally {
      setRunningTests(false);
    }
  };

  if (loading && fleet.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/50 text-sm font-semibold tracking-wider uppercase animate-pulse">
            Booting AI Revenue Optimizer...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white p-6 lg:p-10 space-y-8">
      {/* ── Page Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.06] pb-6">
        <div>
          <span className="text-[#3B82F6] text-[10px] font-mono tracking-widest uppercase">
            AI Revenue Management Suite V2.0
          </span>
          <h1 className="text-3xl font-black mt-1 leading-none tracking-tight">Revenue Control Center</h1>
          <p className="text-white/40 text-sm mt-1.5 font-medium">
            Analyze expected margins, simulate cancellations, target promotions, and review daily forecast paths.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            ← Operations Dashboard
          </Link>
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-all font-black cursor-pointer shadow-lg"
          >
            🔄 Sync Data
          </button>
        </div>
      </header>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <KpiCard title="Revenue Today" value={formatINR(kpis.expectedRevenue * 0.08)} icon="💰" />
        <KpiCard title="Expected Month" value={formatINR(kpis.expectedRevenue)} icon="🗓️" />
        <KpiCard title="Lost Revenue" value={formatINR(kpis.lostRevenue)} icon="📉" />
        <KpiCard title="Opportunity" value={formatINR(kpis.opportunityRevenue)} icon="💡" accent />
        <KpiCard title="Idle Cost" value={formatINR(kpis.idleCost)} icon="🪵" />
        <KpiCard title="Leakage Total" value={formatINR(kpis.leakageRevenue)} icon="💧" />
        <KpiCard title="Fleet Occupancy" value={`${kpis.occupancy}%`} icon="🏎️" />
        <KpiCard title="Utilization" value={`${kpis.utilization}%`} icon="📈" />
        <KpiCard title="Idle Vehicles" value={kpis.idleVehicles} icon="🛑" />
        <KpiCard title="Avg Booking Value" value={formatINR(kpis.abv)} icon="🏷️" />
        <KpiCard title="Top Vehicle" value={kpis.topVehicle} icon="🏆" />
        <KpiCard title="Worst Vehicle" value={kpis.worstVehicle} icon="⚠️" />
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-white/10 gap-2">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
        <TabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>Analytics</TabButton>
        <TabButton active={activeTab === "operations"} onClick={() => setActiveTab("operations")}>Operations</TabButton>
        <TabButton active={activeTab === "diagnostics"} onClick={() => setActiveTab("diagnostics")}>Diagnostics</TabButton>
      </div>

      {/* ── Tab Content ── */}
      <div className="space-y-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Top 10 Actionable Recommendations */}
            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h2 className="text-lg font-black tracking-tight text-white/90">Top Actionable Recommendations</h2>
                <ul className="divide-y divide-white/[0.04] space-y-3.5">
                  {recommendations.length === 0 ? (
                    <li className="py-6 text-center text-white/30 text-sm">All operations optimized. No recommendations queue.</li>
                  ) : (
                    recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-4 pt-3.5 first:pt-0">
                        <div className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-xs font-bold text-[#3B82F6]">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-semibold text-white/80 mt-0.5">{rec}</p>
                        </div>
                        <button
                          disabled={executingIndex !== null}
                          onClick={() => handleExecuteAction(idx, rec)}
                          className="px-3.5 py-1.5 bg-[#3B82F6] text-[#0f1115] font-extrabold text-[10px] uppercase tracking-wider rounded-lg hover:bg-[#60A5FA] disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
                        >
                          {executingIndex === idx ? "Executing..." : "Execute"}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Customer Segmentation & CLV list */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h2 className="text-lg font-black tracking-tight text-white/90">Customer Lifetime Value & Segments</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Customer</th>
                        <th className="pb-3 px-2">Segment Classification</th>
                        <th className="pb-3 px-2">LTV Score</th>
                        <th className="pb-3 pl-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {customers.slice(0, 5).map((c, i) => (
                        <tr key={i} className="hover:bg-white/[0.005] transition-colors">
                          <td className="py-3 pr-2">
                            <p className="font-bold text-white/95">{c.fullName}</p>
                            <p className="text-white/30 text-[10px] font-mono">{c.email}</p>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.segment === "VIP" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : c.segment === "Risk Customer"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-white/5 text-white/60 border border-white/10"
                            }`}>
                              {c.segment}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono font-bold text-white/80">{formatINR(c.clv)}</td>
                          <td className="py-3 pl-2 text-right">
                            <button className="text-[10px] text-[#3B82F6] hover:underline font-bold">Inspect Profile</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Insights Board */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
              <h2 className="text-lg font-black tracking-tight text-white/90">AI Insights Board</h2>
              <div className="space-y-4">
                {insights.map((ins) => (
                  <div key={ins.id} className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                        ins.type === "demand" 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : ins.type === "fleet"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {ins.type} Alert
                      </span>
                      <span className="text-[9px] text-white/30 font-mono">
                        {new Date(ins.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white/95">{ins.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed font-medium">{ins.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Demand Projections Graph */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Demand Projections (Index 0-100)</h3>
                <div className="h-[150px] w-full flex items-end gap-3 justify-between pt-6">
                  <ForecastBar label="Tomorrow" value={forecast.tomorrowIndex} conf={forecast.tomorrowConf} />
                  <ForecastBar label="7 Days" value={forecast.next7DaysIndex} conf={forecast.next7DaysConf} />
                  <ForecastBar label="30 Days" value={forecast.next30DaysIndex} conf={forecast.next30DaysConf} />
                  <ForecastBar label="90 Days" value={forecast.next90DaysIndex} conf={forecast.next90DaysConf} />
                </div>
              </div>

              {/* Financial Leakage and Losses */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Staged Opportunities and Leakages</h3>
                <div className="space-y-4">
                  <ProgressRow label="Expected Billing" value={kpis.expectedRevenue} max={kpis.potentialRevenue} color="from-emerald-500 to-teal-400" />
                  <ProgressRow label="Cancelled Lost Bookings" value={kpis.lostRevenue} max={kpis.potentialRevenue} color="from-red-500 to-rose-400" />
                  <ProgressRow label="Idle Capacity Deficit" value={kpis.idleCost} max={kpis.potentialRevenue} color="from-yellow-500 to-orange-400" />
                  <ProgressRow label="Pending Payment Leakage" value={kpis.leakageRevenue} max={kpis.potentialRevenue} color="from-blue-500 to-sky-400" />
                </div>
              </div>
            </div>

            {/* Fleet Relocations & Recommendations table */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Fleet Performance & Distribution Suggestions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-[9px] font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-2">Vehicle Model</th>
                      <th className="pb-3 px-2">Daily Rate</th>
                      <th className="pb-3 px-2">Utilization</th>
                      <th className="pb-3 px-2">Classification</th>
                      <th className="pb-3 pl-2">AI Relocation / Marketing Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {fleet.slice(0, 8).map((f) => (
                      <tr key={f.id} className="hover:bg-white/[0.005] transition-colors">
                        <td className="py-2.5 pr-2 font-bold text-white/90">{f.brand} {f.model}</td>
                        <td className="py-2.5 px-2 font-mono text-white/50">{formatINR(f.dailyRate)}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${f.utilization}%` }} />
                            </div>
                            <span className="font-mono text-white/60 text-[10px]">{f.utilization}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            f.status === "overbooked"
                              ? "bg-red-500/15 text-red-400"
                              : f.status === "idle"
                                ? "bg-yellow-500/15 text-yellow-400"
                                : "bg-emerald-500/15 text-emerald-400"
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="py-2.5 pl-2 text-white/50">{f.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* OPERATIONS TAB */}
        {activeTab === "operations" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Promotions and Upsells */}
            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Dynamic Promotions Recommendations</h3>
                <ul className="space-y-4">
                  {promotions.map((p, i) => (
                    <li key={i} className="p-4 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.02] flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white/95">{p.promoName}</h4>
                          <span className="px-2 py-0.5 rounded bg-[#3B82F6] text-black font-mono font-black text-[9px]">{p.promoCode}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-1 font-medium">{p.reason}</p>
                      </div>
                      <button className="px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/20 text-[10px] uppercase tracking-wider font-extrabold rounded-lg cursor-pointer whitespace-nowrap">
                        Launch Campaign
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade Recommendations list */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Vehicle Upgrade / Upsell Projections</h3>
                <ul className="space-y-4">
                  {upgrades.map((u, i) => (
                    <li key={i} className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white/90">
                          Upsell: {u.brand} {u.model} → <span className="text-[#3B82F6]">{u.targetUpgradeBrand} {u.targetUpgradeModel}</span>
                        </h4>
                        <p className="text-xs text-white/40 mt-1">Acceptance probability: {u.probability}% | Exp Revenue Growth: +{formatINR(u.revenueIncrease)}/day</p>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold font-mono">+{u.probability}% Probability</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cancellation Predictor */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Cancellation Probability Risk List</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-[9px] font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Reference</th>
                        <th className="pb-3 px-2">Customer</th>
                        <th className="pb-3 px-2">Risk Probability</th>
                        <th className="pb-3 pl-2">Mitigation Directive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {cancellations.map((c) => (
                        <tr key={c.bookingId} className="hover:bg-white/[0.005] transition-colors">
                          <td className="py-2.5 pr-2 font-mono font-bold text-[#3B82F6]">{c.bookingRef}</td>
                          <td className="py-2.5 px-2 text-white/80">{c.customerName}</td>
                          <td className="py-2.5 px-2">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              c.riskScore >= 70 ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                            }`}>
                              {c.riskScore}% Risk
                            </span>
                          </td>
                          <td className="py-2.5 pl-2 text-white/40 font-semibold">{c.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance Planner Slots */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Scheduled Maintenance Slots (Off-Peak Booking Hours)</h3>
                <ul className="space-y-4">
                  {maintenance.map((m, i) => (
                    <li key={i} className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white/90">
                          {m.brand} {m.model} ({m.type.toUpperCase()})
                        </h4>
                        <p className="text-xs text-white/40 mt-1 font-medium">Scheduled Date: {m.scheduledDate} | {m.reason}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                        Scheduled
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Threshold alerts form panel */}
            <form onSubmit={handleSaveSettings} className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-5 h-fit">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">AI Operations Alert Boundaries</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Min Occupancy Limit Alert (%)</label>
                  <input
                    type="number"
                    value={minOccupancyAlert}
                    onChange={(e) => setMinOccupancyAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Max Utilization Surge Alert (%)</label>
                  <input
                    type="number"
                    value={maxUtilizationAlert}
                    onChange={(e) => setMaxUtilizationAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Idle Days Threshold (Alert trigger)</label>
                  <input
                    type="number"
                    value={idleDaysCap}
                    onChange={(e) => setIdleDaysCap(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Email Alert Recipients (comma-separated)</label>
                  <textarea
                    value={alertEmails}
                    onChange={(e) => setAlertEmails(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white font-mono text-[10px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2.5 bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/20 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                {savingSettings ? "Updating Thresholds..." : "Save AI Controls"}
              </button>
            </form>
          </div>
        )}

        {/* DIAGNOSTICS TAB */}
        {activeTab === "diagnostics" && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white/90">Revenue AI Diagnostics</h2>
                <p className="text-white/40 text-xs mt-1">Execute automated Unit, Integration, Edge Case, Stress, and Security testing scenarios on V2 modules.</p>
              </div>
              <button
                onClick={handleRunTests}
                disabled={runningTests}
                className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
              >
                {runningTests ? "Running Integrity Diagnostics..." : "Run Automated Diagnostics"}
              </button>
            </div>

            {testReports.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testReports.map((r, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    r.status === "passed"
                      ? "bg-emerald-500/[0.02] border-emerald-500/20"
                      : "bg-red-500/[0.02] border-red-500/20"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/45">{r.type}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        r.status === "passed" ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {r.status === "passed" ? "✓ Passed" : "✗ Failed"}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white/90 mt-2">{r.name}</h4>
                    <p className="text-xs text-white/40 mt-1.5 leading-relaxed">{r.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, accent }: { title: string; value: string | number; icon: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02] ${
      accent 
        ? "bg-gradient-to-br from-[#3B82F6]/10 to-transparent border-[#3B82F6]/25 shadow-lg shadow-[#3B82F6]/5" 
        : "bg-white/[0.02] border-white/[0.08]"
    }`}>
      <div className="space-y-1 min-w-0">
        <h4 className="text-white/40 text-[9px] font-black uppercase tracking-wider leading-tight">{title}</h4>
        <p className="text-white text-base md:text-lg font-black tracking-tight leading-none">{value}</p>
      </div>
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm shrink-0">
        {icon}
      </div>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
        active 
          ? "border-[#3B82F6] text-[#3B82F6]" 
          : "border-transparent text-white/40 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function ForecastBar({ label, value, conf }: { label: string; value: number; conf: number }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div className="relative w-12 bg-white/[0.02] border border-white/[0.06] rounded-t-xl h-full flex flex-col justify-end overflow-hidden">
        <motion.div
          className="bg-gradient-to-t from-[#3B82F6]/60 to-[#60A5FA]"
          initial={{ height: 0 }}
          animate={{ height: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-black text-white/90">
          {value}%
        </span>
      </div>
      <span className="text-[10px] font-bold text-white/90">{label}</span>
      <span className="text-[9px] text-white/30 font-mono">{conf}% confidence</span>
    </div>
  );
}

function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / (max || 1)) * 100);
  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white/80">{label}</span>
        <span className="font-mono text-white/40">{formatINR(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.02]">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7 }}
        />
      </div>
    </div>
  );
}
