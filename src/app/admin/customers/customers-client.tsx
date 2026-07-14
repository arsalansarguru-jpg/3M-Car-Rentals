"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  Award, 
  Wallet, 
  Calendar,
  X,
  TrendingUp,
  UserCheck,
  Percent,
  CheckCircle2,
  AlertOctagon,
  PhoneCall,
  Mail,
  UserPlus
} from "lucide-react";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  kyc_status: string;
  loyalty_tier: string;
  profile_completed_percent: number;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  booking_status: string;
  total_amount: number;
}

interface CustomersDashboardClientProps {
  initialCustomers: Customer[];
  bookings: Booking[];
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CustomersDashboardClient({ initialCustomers, bookings }: CustomersDashboardClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  
  // Selection drawer state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [licenseData, setLicenseData] = useState<any>(null);
  const [loadingLicense, setLoadingLicense] = useState(false);

  // Sync state after update operations
  const fetchUpdatedCustomers = async () => {
    const { data } = await supabase
      .from("users")
      .select(`
        *,
        role:roles!inner(name)
      `)
      .eq("role.name", "customer")
      .order("created_at", { ascending: false });
    if (data) {
      setCustomers(data as any);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedId);

  // Fetch customer documents when drawer opens
  useEffect(() => {
    async function fetchLicense() {
      if (!selectedId) {
        setLicenseData(null);
        return;
      }
      setLoadingLicense(true);
      try {
        const { data } = await supabase
          .from("driver_licenses")
          .select("*")
          .eq("user_id", selectedId)
          .maybeSingle();
        setLicenseData(data || null);
      } catch (err) {
        console.error("[CRM] Failed to load user documents:", err);
      } finally {
        setLoadingLicense(false);
      }
    }
    fetchLicense();
  }, [selectedId]);

  // Statistics Calculations
  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.status === "active").length;
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newThisMonth = customers.filter(c => new Date(c.created_at) >= startOfMonth).length;

  const customersWithActiveBookings = Array.from(new Set(
    bookings.filter(b => b.booking_status === "active").map(b => b.user_id)
  )).filter(id => customers.some(c => c.id === id)).length;

  const kycPendingCount = customers.filter(c => c.kyc_status === "under_review" || c.kyc_status === "pending").length;
  const kycApprovedCount = customers.filter(c => c.kyc_status === "approved").length;
  const vipCount = customers.filter(c => c.loyalty_tier === "Platinum" || c.loyalty_tier === "Black").length;
  const lifetimeRevenue = bookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  // Action: Toggle Customer status
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      fetchUpdatedCustomers();
    } catch (err) {
      console.error("[CRM] Status update failed:", err);
    }
  };

  // Action: Toggle Customer Loyalty Tier
  const handleLoyaltyChange = async (id: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ loyalty_tier: newTier })
        .eq("id", id);
      if (error) throw error;
      fetchUpdatedCustomers();
    } catch (err) {
      console.error("[CRM] Loyalty update failed:", err);
    }
  };

  // Combine customers and bookings metrics for display
  const customersWithStats = filteredCustomers().map(c => {
    const customerBookings = bookings.filter(b => b.user_id === c.id);
    const totalSpent = customerBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const totalBookingsCount = customerBookings.length;
    return {
      ...c,
      totalSpent,
      totalBookingsCount
    };
  });

  function filteredCustomers() {
    return customers.filter(c => {
      const matchesSearch = 
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesKyc = kycFilter === "all" || c.kyc_status === kycFilter;

      return matchesSearch && matchesStatus && matchesKyc;
    });
  }

  const getKycBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "under_review":
      case "pending":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "action_required":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-white/5 border-white/10 text-white/40";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "pending":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "suspended":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-white/5 border-white/10 text-white/50";
    }
  };

  const getLoyaltyBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "black":
        return "bg-[#090a0f] border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(201,168,76,0.15)]";
      case "platinum":
        return "bg-slate-500/10 border-slate-500/20 text-slate-300";
      case "gold":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-white/5 border-white/10 text-white/50";
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-widest block mb-1">Prestige Command Center</span>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Customer Relationship Manager</h1>
          <p className="text-white/40 text-xs mt-1">Manage user verification streams, client classifications, and loyalty parameters.</p>
        </div>
      </div>

      {/* ─── STATS KPI GRID ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Customers", value: totalCustomers, icon: Users, color: "text-[#3B82F6] bg-blue-500/5 border-blue-500/10" },
          { title: "Active Accounts", value: activeCount, icon: UserCheck, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
          { title: "New Signups", value: newThisMonth, icon: UserPlus, color: "text-blue-400 bg-blue-500/5 border-blue-500/10" },
          { title: "Active Bookings", value: customersWithActiveBookings, icon: Calendar, color: "text-purple-400 bg-purple-500/5 border-purple-500/10" },
          { title: "KYC Pending Review", value: kycPendingCount, icon: AlertOctagon, color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
          { title: "KYC Approved", value: kycApprovedCount, icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
          { title: "VIP Tier Clients", value: vipCount, icon: Award, color: "text-[#C9A84C] bg-amber-500/5 border-[#C9A84C]/10" },
          { title: "Lifetime Revenue", value: formatINR(lifetimeRevenue), icon: Wallet, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" }
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={`border rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl ${card.color}`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider block">{card.title}</span>
              <span className="text-xl md:text-2xl font-black text-white mt-1 block font-mono leading-none">{card.value}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <card.icon className="w-5 h-5 shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── SEARCH & FILTER CONTROLS ─── */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <h3 className="text-white font-extrabold text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Customer Register</h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 w-full md:w-56"
            />
          </div>

          {/* Selector filters */}
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none flex-1 md:flex-initial"
            >
              <option value="all">All Accounts</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none flex-1 md:flex-initial"
            >
              <option value="all">All KYC Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="action_required">Action Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── CUSTOMER CRM TABLE ─── */}
      <div className="border border-white/15 bg-white/[0.01] rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider bg-white/[0.02]">
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6">KYC Status</th>
                <th className="py-4 px-6">Loyalty Club</th>
                <th className="py-4 px-6 text-right">Total Bookings</th>
                <th className="py-4 px-6 text-right">Lifetime Spent</th>
                <th className="py-4 px-6 text-center">Manage Account</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-white/80">
              {customersWithStats.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedId(c.id)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-4 px-6 font-semibold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center font-bold text-[#3B82F6] uppercase">
                      {c.first_name?.[0] || ""}{c.last_name?.[0] || ""}
                    </div>
                    <div>
                      <span className="text-white font-bold">{c.first_name} {c.last_name}</span>
                      <span className="text-[9px] text-white/30 block mt-0.5 font-mono">ID: {c.id.substring(0, 8)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-0.5">
                      <span className="flex items-center gap-1.5 text-white/60"><Mail className="w-3.5 h-3.5 text-white/20" /> {c.email}</span>
                      {c.phone && <span className="flex items-center gap-1.5 text-white/60"><PhoneCall className="w-3.5 h-3.5 text-white/20" /> {c.phone}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getKycBadgeColor(c.kyc_status)}`}>
                      {c.kyc_status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getLoyaltyBadge(c.loyalty_tier)}`}>
                      {c.loyalty_tier}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-white/60">{c.totalBookingsCount}</td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-[#3B82F6]">{formatINR(c.totalSpent)}</td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className="bg-[#090a0f] border border-white/10 rounded-xl px-2 py-1 text-[10px] text-white focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedId(c.id)}
                      className="text-[9px] uppercase font-bold py-1 h-auto rounded-lg px-2.5"
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
              {customersWithStats.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/30 font-mono italic">
                    No customers found matching registry filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Drawer / Sidebar ─── */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex justify-end select-none">
            {/* Dark glass overlay */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
              onClick={() => setSelectedId(null)} 
            />
            
            {/* Luxury Drawer Panel */}
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="w-full max-w-xl bg-[#0c0d10] border-l border-white/10 h-full relative z-10 flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-6">
                
                {/* Header panel */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-[#3B82F6] uppercase tracking-wider">Registered Since: {new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
                    <h3 className="text-white text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Customer Dossier</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Personal specs */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block font-sans">Verification & Account Parameters</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/40">Loyalty Club Tier</label>
                      <select
                        value={selectedCustomer.loyalty_tier}
                        onChange={(e) => handleLoyaltyChange(selectedCustomer.id, e.target.value)}
                        className="bg-[#090a0f] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      >
                        <option value="Silver">Silver Member</option>
                        <option value="Gold">Gold Club</option>
                        <option value="Platinum">Platinum Royal</option>
                        <option value="Black">Black Club</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/40">Onboarding Step Completion</label>
                      <div className="bg-[#090a0f] border border-white/10 rounded-xl py-2 px-3 text-xs text-white/60 font-mono">
                        {selectedCustomer.profile_completed_percent}% Complete
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Scans */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">KYC Verification Documents</span>
                  
                  {loadingLicense ? (
                    <div className="text-[10px] text-white/30 font-mono py-4">Syncing credential documents...</div>
                  ) : licenseData ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-4 font-mono">
                        <div>
                          <span className="text-white/30 text-[8px] block uppercase">Driver Licence No</span>
                          <span className="text-white mt-0.5 block font-bold">{licenseData.license_number || "Not uploaded"}</span>
                        </div>
                        <div>
                          <span className="text-white/30 text-[8px] block uppercase">Govt ID Card ({licenseData.govt_id_type || "N/A"})</span>
                          <span className="text-white mt-0.5 block font-bold">{licenseData.govt_id_number || "Not uploaded"}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {licenseData.license_front_url && (
                          <a href={licenseData.license_front_url} target="_blank" rel="noreferrer" className="block p-2 rounded bg-white/5 border border-white/10 text-[9px] uppercase text-[#3B82F6] hover:underline text-center">
                            Licence Front
                          </a>
                        )}
                        {licenseData.license_back_url && (
                          <a href={licenseData.license_back_url} target="_blank" rel="noreferrer" className="block p-2 rounded bg-white/5 border border-white/10 text-[9px] uppercase text-[#3B82F6] hover:underline text-center">
                            Licence Back
                          </a>
                        )}
                        {licenseData.govt_id_url && (
                          <a href={licenseData.govt_id_url} target="_blank" rel="noreferrer" className="block p-2 rounded bg-white/5 border border-white/10 text-[9px] uppercase text-[#3B82F6] hover:underline text-center">
                            Govt ID Scan
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-white/30 font-mono italic py-4">No verified credential scans exist for this customer.</div>
                  )}
                </div>

                {/* Booking History logs */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Reservation History</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar font-mono text-[10px]">
                    {bookings.filter(b => b.user_id === selectedCustomer.id).length > 0 ? (
                      bookings.filter(b => b.user_id === selectedCustomer.id).map((b) => (
                        <div key={b.id} className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/5">
                          <span className="text-[#3B82F6] font-bold">Booking #{b.id.substring(0, 8)}</span>
                          <span className="text-white/55">{formatINR(b.total_amount)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                            b.booking_status === "completed" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 border"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400 border"
                          }`}>
                            {b.booking_status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/20 italic p-2">No historical bookings recorded.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer CTA */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={() => setSelectedId(null)}
                  variant="outline"
                  className="rounded-xl text-[10px] uppercase font-bold px-6 py-2 h-auto"
                >
                  Close Dossier
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
