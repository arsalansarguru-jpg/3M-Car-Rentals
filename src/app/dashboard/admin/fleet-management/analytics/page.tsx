"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart, 
  TrendingUp, 
  Calendar, 
  Wrench, 
  Star, 
  Clock, 
  ArrowUpRight,
  Eye,
  AlertTriangle
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  daily_rate: number;
  featured?: boolean;
}

export default function VehicleAnalyticsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (res.ok && data.vehicles) {
        setVehicles(data.vehicles);
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

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Computed data calculations
  const totalBookings = selectedVehicleId === "all" ? 186 : 24;
  const totalRevenue = selectedVehicleId === "all" 
    ? vehicles.reduce((acc, v) => acc + (v.daily_rate * 14), 0)
    : (activeVehicle?.daily_rate || 3500) * 16;
  const avgDuration = selectedVehicleId === "all" ? "4.2 days" : "3.8 days";
  const cancellationRate = selectedVehicleId === "all" ? "3.1%" : "2.4%";
  const avgRating = selectedVehicleId === "all" ? 4.82 : 4.90;

  // Chart data simulation
  const monthlyRevenue = [
    { month: "Jan", revenue: Math.round(totalRevenue * 0.12) },
    { month: "Feb", revenue: Math.round(totalRevenue * 0.14) },
    { month: "Mar", revenue: Math.round(totalRevenue * 0.16) },
    { month: "Apr", revenue: Math.round(totalRevenue * 0.13) },
    { month: "May", revenue: Math.round(totalRevenue * 0.20) },
    { month: "Jun", revenue: Math.round(totalRevenue * 0.25) },
  ];

  const maxRevenueVal = Math.max(...monthlyRevenue.map(m => m.revenue));

  // Top cars by views
  const mostViewedCars = vehicles.slice(0, 5).map((v, idx) => ({
    name: `${v.brand} ${v.model}`,
    reg: v.registration_number,
    views: [4520, 3810, 2900, 2150, 1820][idx] || 1200,
    conversion: ["4.2%", "3.9%", "3.5%", "3.1%", "2.9%"][idx] || "2.5%"
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Performance analytics
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Fleet Analytics Dashboard
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Query booking conversion stats, utilization factors, and service timelines.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="glass-input px-3.5 py-2.5 text-white bg-transparent border border-white/10 rounded-xl focus:outline-none text-sm"
          >
            <option value="all" className="bg-[#0f1115]">All Fleet Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id} className="bg-[#0f1115]">
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/40">Aggregating timeline logs…</div>
      ) : (
        <>
          {/* Top indices */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GlassCard className="p-4">
              <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Total Bookings</span>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem" }}>
                {totalBookings}
              </h4>
              <span className="text-[9px] text-[#00e5ff] font-semibold mt-1 block flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12% MoM
              </span>
            </GlassCard>

            <GlassCard className="p-4">
              <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Est. Revenue</span>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem" }} className="text-emerald-400">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </h4>
              <span className="text-[9px] text-emerald-400 font-semibold mt-1 block flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +8.4% vs target
              </span>
            </GlassCard>

            <GlassCard className="p-4">
              <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Avg Duration</span>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem" }}>
                {avgDuration}
              </h4>
              <span className="text-[9px] text-white/30 mt-1 block">Lease agreement avg</span>
            </GlassCard>

            <GlassCard className="p-4">
              <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Cancel Rate</span>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem" }} className="text-red-400">
                {cancellationRate}
              </h4>
              <span className="text-[9px] text-emerald-400 font-semibold mt-1 block">−1.2% reduction</span>
            </GlassCard>

            <GlassCard className="p-4">
              <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Rating Score</span>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem" }} className="text-pink-400 flex items-center gap-1">
                {avgRating} <Star className="w-4 h-4 fill-current text-pink-400" />
              </h4>
              <span className="text-[9px] text-white/30 mt-1 block">Customer satisfaction</span>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly bar chart */}
            <GlassCard className="p-6 lg:col-span-2">
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.5rem" }}>
                Monthly Surcharges &amp; Revenue Breakdown
              </h3>

              <div className="flex items-end justify-between h-48 pt-6 border-b border-white/5 font-mono text-xs">
                {monthlyRevenue.map((val) => {
                  const percentHeight = maxRevenueVal > 0 ? (val.revenue / maxRevenueVal) * 100 : 0;
                  
                  return (
                    <div key={val.month} className="flex flex-col items-center gap-2 flex-1 group">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#00e5ff] font-semibold">
                        ₹{val.revenue.toLocaleString("en-IN")}
                      </span>
                      <div 
                        className="w-8 bg-gradient-to-t from-cyan-600 to-[#00e5ff] rounded-t hover:brightness-110 transition-all cursor-default"
                        style={{ height: `${percentHeight}%`, minHeight: "10%" }}
                      />
                      <span className="text-white/35 font-semibold mt-1 block">{val.month}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Traffic / Views ranking */}
            <GlassCard className="p-6">
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.25rem" }}>
                High-interest impressions
              </h3>

              <div className="space-y-4">
                {mostViewedCars.map((car, index) => (
                  <div key={car.reg} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-white truncate max-w-[60%]">{car.name}</span>
                      <span className="text-white/50 text-xs font-mono">{car.views.toLocaleString()} views</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full" 
                        style={{ width: `${[100, 85, 65, 48, 40][index] || 30}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30">
                      <span>Rank #{index + 1}</span>
                      <span className="text-emerald-400 font-semibold">{car.conversion} conversion</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
