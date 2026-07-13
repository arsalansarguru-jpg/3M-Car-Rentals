"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Car, Wallet, ArrowUpRight, ArrowDownRight, Zap, GripHorizontal, Save, Layout } from "lucide-react";
import { type DashboardMetrics } from "@/lib/dashboard-engine";
import { type AIBriefing } from "@/lib/ai-assistant-engine";
import { CopilotWidget } from "@/components/dashboard/CopilotWidget";
import { GlassCard } from "@/components/ui/GlassCard";
import { Responsive, WidthProvider, Layout as GridLayout } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Animated Counter Component
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const ease = 1 - Math.pow(1 - percentage, 4);
      setDisplayValue(value * ease);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}
      {displayValue > 1000 
        ? displayValue.toLocaleString("en-IN", { maximumFractionDigits: 0 }) 
        : Math.round(displayValue)}
      {suffix}
    </span>
  );
}

// Circular Progress Component
function CircularProgress({ percentage, label, sublabel, color = "#3B82F6" }: { percentage: number, label: string, sublabel: string, color?: string }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>{percentage}%</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff" }}>{label}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>{sublabel}</p>
      </div>
    </div>
  );
}

const DEFAULT_LAYOUTS = {
  lg: [
    { i: "kpi-revenue", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "kpi-bookings", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "kpi-customers", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "kpi-vehicles", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "ai-panel", x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
    { i: "activity-feed", x: 8, y: 2, w: 4, h: 7, minW: 3, minH: 4 },
    { i: "fleet-telemetrics", x: 0, y: 6, w: 8, h: 3, minW: 4, minH: 3 },
  ]
};

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  
  // OS Layout State
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<any>(DEFAULT_LAYOUTS);

  useEffect(() => {
    // Load layouts from localStorage if available
    const savedLayout = localStorage.getItem("os_dashboard_layout");
    if (savedLayout) {
      try {
        setLayouts(JSON.parse(savedLayout));
      } catch(e) {}
    }

    async function loadData() {
      try {
        const [metricsRes, briefingRes] = await Promise.all([
          fetch("/api/dashboard/metrics"),
          fetch("/api/assistant/briefing")
        ]);
        
        if (metricsRes.ok) {
          const { metrics } = await metricsRes.json();
          setMetrics(metrics);
        }
        
        if (briefingRes.ok) {
          const { briefing } = await briefingRes.json();
          setBriefing(briefing);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    if (!isEditMode) {
      // Auto-save on resize/drag if not in explicit edit mode, but normally we restrict dragging to edit mode
      localStorage.setItem("os_dashboard_layout", JSON.stringify(allLayouts));
    }
  };

  const saveLayout = () => {
    localStorage.setItem("os_dashboard_layout", JSON.stringify(layouts));
    setIsEditMode(false);
  };

  const resetLayout = () => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem("os_dashboard_layout");
    setIsEditMode(false);
  };

  const activities = [
    { id: 1, type: "booking", msg: "VIP Customer Rahul Sharma booked BMW X5.", time: "2 mins ago" },
    { id: 2, type: "system", msg: "Dynamic Pricing algorithm increased SUV rates by 8%.", time: "15 mins ago" },
    { id: 3, type: "fleet", msg: "Audi A6 returned to North Goa Hub and is pending cleaning.", time: "42 mins ago" },
    { id: 4, type: "review", msg: "5-star review received for recent Fortuner rental.", time: "1 hour ago" },
    { id: 5, type: "system", msg: "Scheduled maintenance triggered for 2 vehicles.", time: "3 hours ago" },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-white/5 rounded-[20px]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-[20px]"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-white/5 rounded-[20px]"></div>
          <div className="col-span-1 h-96 bg-white/5 rounded-[20px]"></div>
        </div>
      </div>
    );
  }

  // WidgetWrapper — glass surface with optional glow + drag handle in edit mode
  const WidgetWrapper = ({
    children,
    className = "",
    glow = "none",
  }: {
    children: React.ReactNode;
    dragHandle?: boolean;
    className?: string;
    glow?: "blue" | "emerald" | "purple" | "cyan" | "pink" | "gold" | "amber" | "teal" | "none";
  }) => (
    <div className={`h-full w-full relative overflow-hidden ${
      isEditMode ? 'ring-2 ring-[#3B82F6]/30' : ''
    } glass-card glass-card-hover glass-card-shimmer ${
      glow !== 'none' ? `glass-glow-${glow}` : ''
    } ${className}`}>
      {isEditMode && (
        <div className="absolute top-2 right-2 z-50 p-2 bg-black/60 rounded-[20px] cursor-grab active:cursor-grabbing hover:bg-black/80 text-white/40 hover:text-white drag-handle transition-colors">
          <GripHorizontal className="w-4 h-4" />
        </div>
      )}
      <div className={`h-full w-full ${isEditMode ? 'pointer-events-none opacity-80' : ''} p-6`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em", lineHeight: 1.1 }}>Workspace OS</h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>Modular telemetrics and intelligence workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <>
              <button onClick={resetLayout} className="px-4 py-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>Reset</button>
              <button onClick={saveLayout} className="flex items-center gap-2 bg-[#3B82F6] text-black px-4 py-2 rounded-[20px] shadow-[0_0_15px_rgba(201,168,76,0.3)]" style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 600 }}>
                <Save className="w-4 h-4" /> Save Workspace
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-[20px] text-white transition-colors" style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 500 }}>
              <Layout className="w-4 h-4" /> Edit Layout
            </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .react-grid-item.react-grid-placeholder { background: rgba(201, 168, 76, 0.2) !important; border-radius: 20px; }
        .react-resizable-handle { opacity: ${isEditMode ? 1 : 0}; }
      `}} />

      <ResponsiveGridLayout
        className="layout -mx-2"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-handle"
        margin={[24, 24]}
      >
        
        {/* KPI: Revenue */}
        <div key="kpi-revenue">
          <WidgetWrapper dragHandle glow="emerald" className="!p-0">
            {/* Colored top-edge gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-500/8 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start relative z-10 p-6 h-full flex-col">
              <div className="flex justify-between w-full">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Total Revenue</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.875rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
                    <AnimatedCounter value={metrics?.totalRevenue || 0} prefix="₹" />
                  </h3>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-[20px] border border-emerald-500/20 text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 500 }}>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">+12.5%</span>
                <span className="text-white/30 ml-1 hidden sm:inline">vs last month</span>
              </div>
            </div>
          </WidgetWrapper>
        </div>

        {/* KPI: Bookings */}
        <div key="kpi-bookings">
          <WidgetWrapper dragHandle glow="blue" className="!p-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-blue-500/8 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start relative z-10 p-6 h-full flex-col">
              <div className="flex justify-between w-full">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Active Bookings</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.875rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
                    <AnimatedCounter value={metrics?.activeBookings || 0} />
                  </h3>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-[20px] border border-blue-500/20 text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 500 }}>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">+3.2%</span>
              </div>
            </div>
          </WidgetWrapper>
        </div>

        {/* KPI: Customers */}
        <div key="kpi-customers">
          <WidgetWrapper dragHandle glow="pink" className="!p-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-pink-500/60 to-transparent" />
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-pink-500/8 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start relative z-10 p-6 h-full flex-col">
              <div className="flex justify-between w-full">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Customers</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.875rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
                    <AnimatedCounter value={metrics?.totalCustomers || 0} />
                  </h3>
                </div>
                <div className="p-2.5 bg-pink-500/10 rounded-[20px] border border-pink-500/20 text-pink-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 500 }}>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">+8.1%</span>
              </div>
            </div>
          </WidgetWrapper>
        </div>

        {/* KPI: Vehicles */}
        <div key="kpi-vehicles">
          <WidgetWrapper dragHandle glow="cyan" className="!p-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-cyan-500/8 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start relative z-10 p-6 h-full flex-col">
              <div className="flex justify-between w-full">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Total Vehicles</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.875rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>
                    <AnimatedCounter value={metrics?.totalVehicles || 0} />
                  </h3>
                </div>
                <div className="p-2.5 bg-cyan-500/10 rounded-[20px] border border-cyan-500/20 text-cyan-400">
                  <Car className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 500 }}>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Stable</span>
              </div>
            </div>
          </WidgetWrapper>
        </div>

        {/* AI Operations Copilot Panel */}
        <div key="ai-panel">
          <WidgetWrapper dragHandle glow="purple" className="!p-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
            <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
             <CopilotWidget initialBriefing={briefing ? `${briefing.revenueAndBookings} ${briefing.fleetStatus}` : undefined} />
          </WidgetWrapper>
        </div>

        {/* Activity Feed */}
        <div key="activity-feed">
          <WidgetWrapper dragHandle glow="gold" className="!p-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-[#3B82F6]/60 to-transparent" />
            <div className="p-6 h-full flex flex-col">
               <div className="flex items-center justify-between mb-6 shrink-0">
                 <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 600, color: "#ffffff" }}>Live Activity</h3>
                 <span className="flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div className="space-y-5 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
                   {activities.map((act) => (
                     <div key={act.id} className="relative flex items-start gap-4">
                       <div className="absolute left-0 w-8 h-8 flex items-center justify-center bg-[#0f1115] z-10">
                         <div className={`w-2.5 h-2.5 rounded-full ${
                           act.type === 'booking' ? 'bg-[#3B82F6]' : 
                           act.type === 'system' ? 'bg-purple-500' : 
                           act.type === 'fleet' ? 'bg-blue-500' : 'bg-emerald-500'
                         }`}></div>
                       </div>
                       <div className="ml-10 w-full pt-1.5">
                         <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.55, color: "rgba(255,255,255,0.8)" }}>{act.msg}</p>
                         <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>{act.time}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </WidgetWrapper>
        </div>

        {/* Fleet Telemetrics */}
        <div key="fleet-telemetrics">
          <WidgetWrapper dragHandle glow="cyan" className="!p-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
             <div className="p-6 h-full flex flex-col justify-between">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-white text-base">Fleet Telemetrics</h3>
                 <button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">View All Fleet</button>
               </div>
               
               <div className="grid grid-cols-3 gap-4 h-full items-center justify-items-center">
                  <CircularProgress percentage={Math.round((metrics?.activeBookings || 0) / Math.max(metrics?.totalVehicles || 1, 1) * 100)} label="Utilization" sublabel="Rented" color="#3B82F6" />
                  <CircularProgress percentage={92} label="Health Score" sublabel="Average" color="#10b981" />
                  <CircularProgress percentage={100} label="Compliance" sublabel="Verified" color="#3b82f6" />
               </div>
             </div>
           </WidgetWrapper>
        </div>

      </ResponsiveGridLayout>

      {/* ── Licensing & Compliance Section ── */}
      <section id="licensing" className="mt-8 scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>Licensing &amp; Compliance</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}>Regulatory status of your fleet and business operations in Goa.</p>
          </div>
          <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest btn-glass btn-glass-success">All Permits Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Tourist Vehicle Permit",
              ref: "TVP/GOA/2024/001",
              issuer: "Goa Motor Vehicles Dept.",
              expiry: "2026-12-31",
              status: "active",
              icon: "🚗",
            },
            {
              title: "Trade License",
              ref: "TL/PANJIM/2024/045",
              issuer: "Panaji Municipal Corporation",
              expiry: "2025-03-31",
              status: "expiring",
              icon: "📋",
            },
            {
              title: "Goods &amp; Services Tax",
              ref: "30AABCT1332L1ZH",
              issuer: "GSTN India",
              expiry: "Permanent",
              status: "active",
              icon: "🏛️",
            },
            {
              title: "Shop &amp; Establishment Act",
              ref: "SE/GOA/2024/0892",
              issuer: "Labour Dept., Goa",
              expiry: "2027-01-15",
              status: "active",
              icon: "🏢",
            },
            {
              title: "Vehicle Insurance (Fleet)",
              ref: "INS/BAJAJ/FLEET/2024",
              issuer: "Bajaj Allianz General Insurance",
              expiry: "2025-09-30",
              status: "active",
              icon: "🛡️",
            },
            {
              title: "Pollution Under Control (Fleet)",
              ref: "PUC/FLEET/GOA/24-25",
              issuer: "Regional Transport Office, Goa",
              expiry: "2025-06-30",
              status: "expiring",
              icon: "🌿",
            },
          ].map((lic) => (
            <div
              key={lic.ref}
              className={`glass-card glass-card-hover glass-card-shimmer p-5 flex flex-col gap-3 relative overflow-hidden cursor-default rounded-[20px] ${
                lic.status === "expiring" ? "glass-glow-amber" : ""
              }`}
            >
              {lic.status === "expiring" && (
                <div className="absolute top-0 right-0 px-2.5 py-1 bg-amber-500/15 text-amber-400 border-l border-b border-amber-500/20 rounded-bl-[20px]" style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Expiring Soon
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[20px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shrink-0">
                  {lic.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff" }} className="truncate">{lic.title}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }} className="font-mono truncate">{lic.ref}</p>
                </div>
              </div>
              <div className="space-y-1.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem" }}>
                <div className="flex justify-between">
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Issuer</span>
                  <span style={{ color: "rgba(255,255,255,0.7)" }} className="text-right max-w-[60%] truncate">{lic.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Valid Until</span>
                  <span style={{ fontWeight: 600, color: lic.status === "expiring" ? "#fbbf24" : "rgba(255,255,255,0.75)" }}>
                    {lic.expiry}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${lic.status === "active" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }} className={lic.status === "active" ? "text-emerald-400" : "text-amber-400"}>
                  {lic.status === "active" ? "Active" : "Renew Soon"}
                </span>
              </div>
            </div>
          ))}        </div>
      </section>
    </div>
  );
}
