"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Award, 
  Calendar,
  Clock,
  Sparkles,
  BarChart3,
  PieChart,
  Percent,
  SlidersHorizontal
} from "lucide-react";

interface Booking {
  id: string;
  total_amount: number;
  booking_status: string;
  created_at: string;
  pickup_datetime: string;
  return_datetime: string;
  vehicle: {
    category: { name: string } | null;
  } | null;
}

interface Customer {
  id: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  daily_rate: number;
}

interface BusinessIntelligenceDashboardClientProps {
  bookings: Booking[];
  customers: Customer[];
  vehicles: Vehicle[];
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BusinessIntelligenceDashboardClient({ bookings, customers, vehicles }: BusinessIntelligenceDashboardClientProps) {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly" | "custom">("monthly");
  
  // Custom Date Range State
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Timeframe limits helper
  const periods = useMemo(() => {
    let currentStart = new Date();
    let currentEnd = new Date();
    let compareStart = new Date();
    let compareEnd = new Date();

    const now = new Date();

    if (timeRange === "daily") {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      compareStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
      compareEnd = new Date(currentEnd.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === "weekly") {
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      currentEnd = now;

      compareStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      compareEnd = currentStart;
    } else if (timeRange === "monthly") {
      currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      currentEnd = now;

      compareStart = new Date(currentStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      compareEnd = currentStart;
    } else if (timeRange === "yearly") {
      currentStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      currentEnd = now;

      compareStart = new Date(currentStart.getTime() - 365 * 24 * 60 * 60 * 1000);
      compareEnd = currentStart;
    } else if (timeRange === "custom") {
      currentStart = new Date(startDate);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(endDate);
      currentEnd.setHours(23, 59, 59, 999);

      const durationMs = currentEnd.getTime() - currentStart.getTime();
      compareStart = new Date(currentStart.getTime() - durationMs);
      compareEnd = currentStart;
    }

    return { currentStart, currentEnd, compareStart, compareEnd };
  }, [timeRange, startDate, endDate]);

  // Aggregate Metrics Helper
  const metrics = useMemo(() => {
    const filterByRange = (items: any[], dateKey: string, start: Date, end: Date) => {
      return items.filter(item => {
        const d = new Date(item[dateKey]);
        return d >= start && d <= end;
      });
    };

    // Current Period Data
    const curBookings = filterByRange(bookings, "created_at", periods.currentStart, periods.currentEnd);
    const curActiveBookings = curBookings.filter(b => b.booking_status !== "cancelled");
    const curRevenue = curActiveBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const curCustomers = filterByRange(customers, "created_at", periods.currentStart, periods.currentEnd).length;
    const curBookingsCount = curActiveBookings.length;
    const curAOV = curBookingsCount > 0 ? Math.round(curRevenue / curBookingsCount) : 0;

    // Compare Period Data
    const prevBookings = filterByRange(bookings, "created_at", periods.compareStart, periods.compareEnd);
    const prevActiveBookings = prevBookings.filter(b => b.booking_status !== "cancelled");
    const prevRevenue = prevActiveBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const prevCustomers = filterByRange(customers, "created_at", periods.compareStart, periods.compareEnd).length;
    const prevBookingsCount = prevActiveBookings.length;
    const prevAOV = prevBookingsCount > 0 ? Math.round(prevRevenue / prevBookingsCount) : 0;

    // Calculate Growth Percentages
    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const revenueGrowth = calcGrowth(curRevenue, prevRevenue);
    const bookingsGrowth = calcGrowth(curBookingsCount, prevBookingsCount);
    const customersGrowth = calcGrowth(curCustomers, prevCustomers);
    const aovGrowth = calcGrowth(curAOV, prevAOV);

    // Fleet Category Revenue Share
    const categoryRevenue: Record<string, number> = {};
    curActiveBookings.forEach(b => {
      const cat = b.vehicle?.category?.name || "General Fleet";
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + Number(b.total_amount || 0);
    });

    const categoryShares = Object.entries(categoryRevenue).map(([name, value]) => ({
      name,
      value,
      percent: curRevenue > 0 ? Math.round((value / curRevenue) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    // Utilization Factor conceptually mapped
    const totalVehicles = vehicles.length;
    const rentedDays = curActiveBookings.reduce((sum, b) => {
      const start = new Date(b.pickup_datetime);
      const end = new Date(b.return_datetime);
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
      return sum + days;
    }, 0);
    const durationDays = Math.max(1, Math.round((periods.currentEnd.getTime() - periods.currentStart.getTime()) / (24 * 60 * 60 * 1000)));
    const maxAvailableDays = totalVehicles * durationDays;
    const utilizationPct = maxAvailableDays > 0 ? Math.min(100, Math.round((rentedDays / maxAvailableDays) * 100)) : 0;

    // Compare period utilization
    const prevRentedDays = prevActiveBookings.reduce((sum, b) => {
      const start = new Date(b.pickup_datetime);
      const end = new Date(b.return_datetime);
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
      return sum + days;
    }, 0);
    const prevDurationDays = Math.max(1, Math.round((periods.compareEnd.getTime() - periods.compareStart.getTime()) / (24 * 60 * 60 * 1000)));
    const prevMaxAvailableDays = totalVehicles * prevDurationDays;
    const prevUtilizationPct = prevMaxAvailableDays > 0 ? Math.min(100, Math.round((prevRentedDays / prevMaxAvailableDays) * 100)) : 0;
    const utilizationGrowth = calcGrowth(utilizationPct, prevUtilizationPct);

    return {
      revenue: curRevenue,
      revenueGrowth,
      bookings: curBookingsCount,
      bookingsGrowth,
      customers: curCustomers,
      customersGrowth,
      aov: curAOV,
      aovGrowth,
      utilizationPct,
      utilizationGrowth,
      categoryShares
    };
  }, [bookings, customers, vehicles, periods]);

  const renderGrowthBadge = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
        isPositive 
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? `+${growth}%` : `${growth}%`}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-widest block mb-1">Director Intel</span>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Business Intelligence</h1>
          <p className="text-white/40 text-xs mt-1">Strategic audit of revenue distribution, order sizes, and customer growths.</p>
        </div>

        {/* Timeframe selector controls */}
        <div className="flex flex-wrap items-center gap-2">
          {["daily", "weekly", "monthly", "yearly", "custom"].map((p) => (
            <button
              key={p}
              onClick={() => setTimeRange(p as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                timeRange === p 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "bg-[#090a0f] border-white/10 text-white/40 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Custom range datepicker widgets */}
      {timeRange === "custom" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 p-4 bg-white/[0.01] border border-white/10 rounded-2xl"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-white/40">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-white/40">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
        </motion.div>
      )}

      {/* ─── INTEL KPI CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Aggregated Revenue", value: formatINR(metrics.revenue), growth: metrics.revenueGrowth, icon: DollarSign, color: "border-blue-500/10 text-blue-400" },
          { title: "Booking Handovers", value: metrics.bookings, growth: metrics.bookingsGrowth, icon: ShoppingBag, color: "border-emerald-500/10 text-emerald-400" },
          { title: "Customer Signups", value: metrics.customers, growth: metrics.customersGrowth, icon: Users, color: "border-purple-500/10 text-purple-400" },
          { title: "Fleet Utilization", value: `${metrics.utilizationPct}%`, growth: metrics.utilizationGrowth, icon: Percent, color: "border-cyan-500/10 text-cyan-400" },
          { title: "Avg Order Value (AOV)", value: formatINR(metrics.aov), growth: metrics.aovGrowth, icon: BarChart3, color: "border-amber-500/10 text-amber-400" }
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={`border rounded-2xl bg-white/[0.01] p-5 flex flex-col justify-between backdrop-blur-xl h-[130px] ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase font-bold text-white/30 tracking-wider leading-tight block max-w-[120px]">{card.title}</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <card.icon className="w-4 h-4 shrink-0" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-lg md:text-xl font-black text-white font-mono leading-none">{card.value}</span>
                <span className="text-[8px] uppercase font-bold text-white/20 block mt-1">vs prior period</span>
              </div>
              {renderGrowthBadge(card.growth)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── INVENTORY SHARE & LEDGERS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Category shares breakdown */}
        <div className="lg:col-span-4 bg-white/[0.01] border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: "var(--font-urbanist)" }}><PieChart className="w-4 h-4 text-blue-400" /> Revenue Share</h3>
            <span className="text-[10px] text-white/30 font-bold font-mono">Current Period</span>
          </div>

          <div className="space-y-4">
            {metrics.categoryShares.map((share) => (
              <div key={share.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white/70 uppercase">{share.name}</span>
                  <span className="text-white font-mono">{formatINR(share.value)} ({share.percent}%)</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-[#3B82F6] h-full rounded-full" 
                    style={{ width: `${share.percent}%` }}
                  />
                </div>
              </div>
            ))}
            {metrics.categoryShares.length === 0 && (
              <div className="text-[10px] text-white/30 font-mono italic py-4">No active category shares recorded.</div>
            )}
          </div>
        </div>

        {/* Detailed Bookings Ledger */}
        <div className="lg:col-span-8 border border-white/15 bg-white/[0.01] rounded-3xl overflow-hidden backdrop-blur-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: "var(--font-urbanist)" }}><SlidersHorizontal className="w-4 h-4 text-blue-400" /> Period Audits</h3>
            <span className="text-[10px] text-white/30 font-bold font-mono">Filtered Period Bookings</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-[9px] font-bold uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Date Created</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Rental Duration</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings
                  .filter(b => {
                    const d = new Date(b.created_at);
                    return d >= periods.currentStart && d <= periods.currentEnd && b.booking_status !== "cancelled";
                  })
                  .slice(0, 8)
                  .map((b) => {
                    const start = new Date(b.pickup_datetime);
                    const end = new Date(b.return_datetime);
                    const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
                    return (
                      <tr key={b.id}>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#3B82F6]">#{b.booking_reference}</td>
                        <td className="py-3.5 px-4 font-mono text-white/40">{new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-white/60">{b.vehicle?.category?.name || "General"}</td>
                        <td className="py-3.5 px-4 text-white/60 font-mono">{durationDays} days</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">{formatINR(b.total_amount)}</td>
                      </tr>
                    );
                  })}
                {bookings.filter(b => {
                  const d = new Date(b.created_at);
                  return d >= periods.currentStart && d <= periods.currentEnd && b.booking_status !== "cancelled";
                }).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/30 font-mono italic">
                      No matching records during selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
