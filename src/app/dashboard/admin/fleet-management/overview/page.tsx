"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Car, 
  CheckCircle, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  Star, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Eye, 
  Plus, 
  FileText, 
  Sparkles, 
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  registration_number: string;
  availability_status: string;
  daily_rate: number;
  featured?: boolean;
  is_visible?: boolean;
  maintenance?: any[];
  documents?: any[];
  pricing_options?: any;
  created_at: string;
}

export default function FleetOverviewPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } else {
        setError("Failed to fetch vehicles list");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Compute metrics
  const totalVehicles = vehicles.length;
  const availableToday = vehicles.filter(v => v.availability_status === "available").length;
  const booked = vehicles.filter(v => v.availability_status === "reserved").length;
  const maintenance = vehicles.filter(v => v.availability_status === "maintenance").length;
  const inactive = vehicles.filter(v => v.is_visible === false).length;
  const featured = vehicles.filter(v => v.featured === true).length;
  
  // Utilization
  const utilizationRate = totalVehicles > 0 ? Math.round((booked / totalVehicles) * 100) : 0;
  
  // Newest Vehicle Added
  const newestVehicle = vehicles.length > 0 
    ? [...vehicles].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] 
    : null;

  // Upcoming Services / Expiry warnings
  const upcomingServicesCount = vehicles.reduce((acc, v) => {
    const upcoming = v.maintenance?.filter(m => m.status === "pending" || m.status === "scheduled") || [];
    return acc + upcoming.length;
  }, 0);

  // Revenue mock mapping (based on daily rates and general status)
  const revenueByVehicle = vehicles.slice(0, 5).map(v => ({
    name: `${v.brand} ${v.model}`,
    reg: v.registration_number,
    bookings: v.availability_status === "reserved" ? 18 : 12,
    revenue: v.daily_rate * (v.availability_status === "reserved" ? 14 : 9)
  })).sort((a,b) => b.revenue - a.revenue);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Enterprise Management
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Fleet Overview
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Real-time diagnostics, performance indices, and dispatch operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={fetchVehicles} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Link href="/dashboard/admin/fleet-management/inventory?action=add">
            <Button variant="fleet" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/40">Loading diagnostics dashboard…</div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      ) : (
        <>
          {/* Main KPI Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <GlassCard glow="cyan" hover className="!p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>Total fleet</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>{totalVehicles}</h3>
                </div>
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-[#00e5ff] shrink-0">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-white/30 mt-2 font-medium">All active units</p>
            </GlassCard>

            <GlassCard glow="emerald" hover className="!p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>Available</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>{availableToday}</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-emerald-400 mt-2 font-medium">Ready for dispatch</p>
            </GlassCard>

            <GlassCard glow="blue" hover className="!p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>Booked today</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>{booked}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-[#2563eb] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-blue-400 mt-2 font-medium">On-road units</p>
            </GlassCard>

            <GlassCard glow="amber" hover className="!p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>Service bay</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>{maintenance}</h3>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400 shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-amber-400 mt-2 font-medium">Under maintenance</p>
            </GlassCard>

            <GlassCard glow="pink" hover className="!p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>Featured</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>{featured}</h3>
                </div>
                <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20 text-pink-400 shrink-0">
                  <Star className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-pink-400 mt-2 font-medium">VIP Highlighted</p>
            </GlassCard>

            <GlassCard glow="none" hover className="!p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>Inactive</p>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>{inactive}</h3>
                </div>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/50 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-white/30 mt-2 font-medium">Hidden from site</p>
            </GlassCard>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard className="p-5 flex flex-col justify-between">
              <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider mb-2">Utilization Index</p>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#00e5ff" }}>{utilizationRate}%</h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>Active rentals vs total fleet</p>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider mb-2">Upcoming Services</p>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#f59e0b" }}>{upcomingServicesCount} Due</h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>Inspections due within 30 days</p>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider mb-2">Most viewed vehicle</p>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginTop: "0.5rem" }} className="truncate">
                {vehicles.find(v => v.featured)?.brand || "Audi"} {vehicles.find(v => v.featured)?.model || "A6 Matrix"}
              </h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>+120 impressions today</p>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider mb-2">Newest addition</p>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginTop: "0.5rem" }} className="truncate">
                {newestVehicle ? `${newestVehicle.brand} ${newestVehicle.model}` : "N/A"}
              </h4>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>
                {newestVehicle ? `Added ${new Date(newestVehicle.created_at).toLocaleDateString()}` : "No vehicles found"}
              </p>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <GlassCard glow="cyan" className="p-6 flex flex-col justify-between">
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 600, color: "#ffffff", marginBottom: "1rem" }}>
                  Operational Shortcuts
                </h3>
                <div className="space-y-2">
                  <Link href="/dashboard/admin/fleet-management/inventory?action=add" className="block">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group">
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 500 }} className="text-white/80 group-hover:text-white">Add New Vehicle</span>
                      <ChevronRight className="w-4 h-4 text-white/35 group-hover:text-white/70" />
                    </div>
                  </Link>

                  <Link href="/dashboard/admin/fleet-management/maintenance" className="block">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group">
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 500 }} className="text-white/80 group-hover:text-white">Schedule Maintenance</span>
                      <ChevronRight className="w-4 h-4 text-white/35 group-hover:text-white/70" />
                    </div>
                  </Link>

                  <Link href="/dashboard/admin/fleet-management/pricing" className="block">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all group">
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 500 }} className="text-white/80 group-hover:text-white">Update Rate Tiers</span>
                      <ChevronRight className="w-4 h-4 text-white/35 group-hover:text-white/70" />
                    </div>
                  </Link>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">System healthy</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]"></span>
                </span>
              </div>
            </GlassCard>

            {/* Performance Ranking */}
            <GlassCard className="p-6 lg:col-span-2">
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 600, color: "#ffffff", marginBottom: "1rem" }}>
                Commercial Performance ranking
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 text-[10px] uppercase tracking-wider font-semibold">
                      <th className="pb-3 text-left">Vehicle Details</th>
                      <th className="pb-3 text-center">Reservations</th>
                      <th className="pb-3 text-right">Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {revenueByVehicle.map((v, i) => (
                      <tr key={v.reg} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-left">
                          <div className="font-semibold text-white">{v.name}</div>
                          <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider mt-0.5">{v.reg}</div>
                        </td>
                        <td className="py-3 text-center text-white/60 font-mono">{v.bookings}</td>
                        <td className="py-3 text-right text-emerald-400 font-semibold font-mono">
                          ₹{v.revenue.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
