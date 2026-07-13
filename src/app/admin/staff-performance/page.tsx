"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { StaffPerformanceStatus } from "@/lib/staff-performance-engine";

interface DashboardData {
  kpis: {
    totalPickups: number;
    totalLate: number;
    averageRating: number;
    avgResponseTime: number;
    totalCompletedTasks: number;
    totalPendingTasks: number;
    avgPerformanceScore: number;
    onDutyCount: number;
    totalStaff: number;
  };
  staff: StaffPerformanceStatus[];
}

export default function StaffPerformanceCenter() {
  const router = useRouter();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/staff-performance/dashboard");
        if (res.status === 401) {
          router.replace("/login?redirect=/admin/staff-performance");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3B82F6]/20 border-t-[#3B82F6]"></div>
          <p className="text-sm text-white/50 animate-pulse">Loading Operations Center...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-red-400">Failed to load Staff Performance Center. Please try again.</p>
      </div>
    );
  }

  const { kpis, staff } = data;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Staff Operations & Performance Center</h1>
            <p className="text-white/50 mt-1">Live tracking of logistics, driver efficiency, and staff operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard 
          title="Overall Performance" 
          value={`${kpis.avgPerformanceScore}%`}
          subtitle={`Avg score across ${kpis.totalStaff} staff`}
          trend={kpis.avgPerformanceScore > 90 ? "up" : "down"}
          trendValue={kpis.avgPerformanceScore > 90 ? "Excellent" : "Needs Review"}
        />
        <KpiCard 
          title="Total Pickups" 
          value={kpis.totalPickups.toString()}
          subtitle="Completed successful pickups"
          trend="up"
          trendValue={`${kpis.totalCompletedTasks} tasks total`}
        />
        <KpiCard 
          title="Average Rating" 
          value={`${kpis.averageRating} ★`}
          subtitle="Customer feedback score"
          trend={kpis.averageRating >= 4.5 ? "up" : "down"}
          trendValue={kpis.averageRating >= 4.5 ? "Top Tier" : "Needs Focus"}
        />
        <KpiCard 
          title="Logistics Efficiency" 
          value={`${kpis.avgResponseTime}m`}
          subtitle="Average Response Time"
          trend={kpis.totalLate === 0 ? "up" : "down"}
          trendValue={`${kpis.totalLate} Late Deliveries`}
          alert={kpis.totalLate > 5}
        />
      </div>

      {/* Staff Leaderboard */}
      <div className="bg-[#0b101f] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Staff Operational Leaderboard</h2>
          <span className="text-xs font-medium text-white/40 bg-white/5 px-3 py-1 rounded-full">
            {kpis.onDutyCount} / {kpis.totalStaff} Active Now
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4">Pickups</th>
                <th className="px-6 py-4">Tasks (Pend/Comp)</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-center">Response</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{member.staff_name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{member.role}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      member.performance_score >= 90 ? "bg-emerald-500/10 text-emerald-400" :
                      member.performance_score >= 80 ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {member.performance_score}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{member.completed_pickups}</span>
                      {member.late_deliveries > 0 && (
                        <span className="text-red-400 text-[10px] bg-red-400/10 px-1.5 py-0.5 rounded">
                          {member.late_deliveries} late
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="text-white font-medium">{member.completed_tasks}</span>
                      <span>/</span>
                      <span className="text-amber-400 font-medium">{member.pending_tasks} pend</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium">{member.customer_rating}</span>
                      <svg className="w-3.5 h-3.5 text-[#3B82F6]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-white/70 font-medium">{member.average_response_time} mins</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.attendance_status === "Present" ? "bg-emerald-500/10 text-emerald-400" :
                      member.attendance_status === "On Leave" ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        member.attendance_status === "Present" ? "bg-emerald-400" :
                        member.attendance_status === "On Leave" ? "bg-blue-400" :
                        "bg-red-400"
                      }`} />
                      {member.attendance_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Subcomponent
function KpiCard({ title, value, subtitle, trend, trendValue, alert = false }: {
  title: string; value: string | number; subtitle: string; trend?: "up" | "down"; trendValue?: string; alert?: boolean;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0b101f] border p-5 rounded-2xl flex flex-col relative overflow-hidden ${alert ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5'}`}
    >
      <span className="text-sm font-medium text-white/50">{title}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-black text-white tracking-tight">{value}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-white/40">{subtitle}</span>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-1 ${
            trend === "up" ? "text-emerald-400" : "text-amber-400"
          }`}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
    </motion.div>
  );
}
