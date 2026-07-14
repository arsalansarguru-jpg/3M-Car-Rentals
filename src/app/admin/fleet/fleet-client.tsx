"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, 
  Sparkles, 
  Calendar, 
  Activity, 
  Wrench, 
  XCircle, 
  Search,
  SlidersHorizontal,
  Compass,
  Gauge,
  X,
  DollarSign,
  ShieldCheck,
  FileText,
  Navigation,
  CreditCard,
  History,
  CheckSquare,
  Square,
  Download,
  AlertOctagon,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  registration_number: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  fuel_type: string;
  transmission: string;
  daily_rate: number;
  availability_status: string;
  is_visible: boolean;
  category?: {
    name: string;
  } | null;
  metadata?: {
    image_url?: string;
    location?: string;
    gps_coordinates?: string;
    audit_trail?: any[];
  } | null;
  cleanliness_status: string;
  current_odometer: number;
}

interface FleetSummary {
  total: number;
  available: number;
  maintenance: number;
  detailing: number;
  inactive: number;
}

interface FleetClientProps {
  vehicles: Vehicle[];
  summary: FleetSummary;
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FleetClient({ vehicles: initialVehicles, summary: initialSummary }: FleetClientProps) {
  const [localVehicles, setLocalVehicles] = useState<Vehicle[]>(initialVehicles);
  const [localSummary, setLocalSummary] = useState<FleetSummary>(initialSummary);

  // Search & Filter State
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmationAction, setConfirmationAction] = useState<string | null>(null);

  // Background refresh state
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState(false);

  // Selection drawer details state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [healthDetails, setHealthDetails] = useState<any>(null);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);

  // Sync data function (auto-refresh & manually triggered)
  const syncFleetData = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      // 1. Fetch latest vehicles
      const { data: vList } = await supabase
        .from("vehicles")
        .select("*, category:vehicle_categories(name)")
        .order("brand", { ascending: true });

      // 2. Fetch latest cleanliness and mileage
      const { data: hList } = await supabase
        .from("vehicle_health")
        .select("vehicle_id, cleanliness_status, current_odometer");

      if (vList) {
        const mapped = (vList as any[]).map(v => {
          const health = (hList || []).find(h => h.vehicle_id === v.id);
          return {
            ...v,
            cleanliness_status: health?.cleanliness_status || "Clean",
            current_odometer: health?.current_odometer || 0
          };
        });
        setLocalVehicles(mapped);
      }

      // 3. Recalculate summary metrics
      const { count: totalCount } = await supabase.from("vehicles").select("*", { count: "exact", head: true });
      const { count: availCount } = await supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("availability_status", "available");
      const { count: maintCount } = await supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("availability_status", "maintenance");
      const { count: detailCount } = await supabase.from("vehicle_health").select("*", { count: "exact", head: true }).in("cleanliness_status", ["Dirty", "Detailing"]);
      const { count: hiddenCount } = await supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("is_visible", false);

      setLocalSummary({
        total: totalCount || 0,
        available: availCount || 0,
        maintenance: maintCount || 0,
        detailing: detailCount || 0,
        inactive: hiddenCount || 0
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error("[Fleet Monitor] Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  // Background refresh triggers every 30 seconds, cleans up correctly
  useEffect(() => {
    const timer = setInterval(() => {
      syncFleetData();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Debouncing search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Derived filter options
  const brandOptions = useMemo(() => Array.from(new Set(localVehicles.map(v => v.brand))).sort(), [localVehicles]);
  const categoryOptions = useMemo(() => Array.from(new Set(localVehicles.map(v => v.category?.name).filter(Boolean))).sort(), [localVehicles]);
  const locationOptions = useMemo(() => Array.from(new Set(localVehicles.map(v => v.metadata?.location || "Main Office"))).sort(), [localVehicles]);

  // Fetch drawer details dynamically when selectedId changes
  useEffect(() => {
    async function fetchVehicleDetails() {
      if (!selectedId) {
        setHealthDetails(null);
        setBookingHistory([]);
        setMaintenanceLogs([]);
        return;
      }
      setLoadingDetails(true);
      try {
        const { data: health } = await supabase
          .from("vehicle_health")
          .select("*")
          .eq("vehicle_id", selectedId)
          .maybeSingle();
        setHealthDetails(health || null);

        const { data: history } = await supabase
          .from("bookings")
          .select("*, user:users(first_name, last_name, email)")
          .eq("vehicle_id", selectedId)
          .order("pickup_datetime", { ascending: false });
        setBookingHistory(history || []);

        const { data: serviceLogs } = await supabase
          .from("vehicle_maintenance_logs")
          .select("*")
          .eq("vehicle_id", selectedId)
          .order("date", { ascending: false });
        setMaintenanceLogs(serviceLogs || []);
      } catch (err) {
        console.error("[Fleet Drawer] Details fetch failed:", err);
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchVehicleDetails();
  }, [selectedId]);

  // Filter logic (cumulative filters working together)
  const filteredVehicles = useMemo(() => {
    return localVehicles.filter(v => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        v.registration_number.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q);

      const matchesBrand = brandFilter === "all" || v.brand === brandFilter;
      const matchesCategory = categoryFilter === "all" || v.category?.name === categoryFilter;
      const matchesFuel = fuelFilter === "all" || v.fuel_type === fuelFilter;
      const matchesTransmission = transmissionFilter === "all" || v.transmission === transmissionFilter;
      const matchesAvailability = availabilityFilter === "all" || v.availability_status === availabilityFilter;
      
      const loc = v.metadata?.location || "Main Office";
      const matchesLocation = locationFilter === "all" || loc === locationFilter;

      return matchesSearch && matchesBrand && matchesCategory && matchesFuel && matchesTransmission && matchesAvailability && matchesLocation;
    });
  }, [localVehicles, debouncedSearch, brandFilter, categoryFilter, fuelFilter, transmissionFilter, availabilityFilter, locationFilter]);

  const selectedVehicle = localVehicles.find(v => v.id === selectedId);
  const totalRevenue = bookingHistory
    .filter(b => b.booking_status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  const reservedCount = localVehicles.filter(v => v.availability_status === "reserved").length;
  const activeCalculated = reservedCount;

  // Toggle Selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredVehicles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVehicles.map(v => v.id));
    }
  };

  // Perform Server-Side Audited Bulk Action
  const handleExecuteBulkAction = async () => {
    if (!confirmationAction || selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/admin/fleet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleIds: selectedIds,
          action: confirmationAction
        })
      });

      if (!res.ok) throw new Error("Bulk action failed");

      // Reset selection and trigger sync refresh
      setSelectedIds([]);
      setConfirmationAction(null);
      syncFleetData();
      alert("Bulk operation and audit logs committed successfully.");
    } catch (err) {
      console.error("[Fleet Client] Bulk update failed:", err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const targets = selectedIds.length > 0 
      ? localVehicles.filter(v => selectedIds.includes(v.id))
      : filteredVehicles;

    const headers = "Registration Number,Brand,Model,Daily Rate,Availability,Cleanliness,Mileage (KM),Location\n";
    const rows = targets.map(v => {
      const location = v.metadata?.location || "Main Office";
      return `"${v.registration_number}","${v.brand}","${v.model}",${v.daily_rate},"${v.availability_status}","${v.cleanliness_status}",${v.current_odometer},"${location}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fleet_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    setSelectedIds([]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "reserved":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "maintenance":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "coming_soon":
      case "limited":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-white/5 border-white/10 text-white/50";
    }
  };

  const getCleanlinessColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "clean":
        return "text-emerald-400";
      case "detailing":
        return "text-purple-400";
      case "dirty":
        return "text-amber-400";
      default:
        return "text-white/40";
    }
  };

  const getVehicleImage = (v: Vehicle) => {
    if (v.metadata?.image_url) return v.metadata.image_url;
    if (v.brand.toLowerCase().includes("porsche")) {
      return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600";
    }
    if (v.brand.toLowerCase().includes("mercedes") || v.brand.toLowerCase().includes("amg")) {
      return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600";
    }
    if (v.brand.toLowerCase().includes("bmw")) {
      return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
    }
    return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600";
  };

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-widest block mb-1">Prestige Command Center</span>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Fleet Register</h1>
          <p className="text-white/40 text-xs mt-1">Review live inventory metrics, availability classifications, and maintenance lanes.</p>
        </div>

        {/* Real-time Indicator Panel */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#090a0f] border border-white/10 px-3 py-1.5 rounded-xl text-[10px] text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block" />
            <span className="font-bold uppercase tracking-widest text-[9px]">Live Syncing</span>
          </div>

          <button
            onClick={syncFleetData}
            disabled={syncing}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all flex items-center justify-center shrink-0 disabled:opacity-20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          </button>
          
          <span className="text-[8.5px] font-mono text-white/30 uppercase">
            Synced: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { title: "Total Vehicles", value: localSummary.total, icon: Car, color: "text-blue-400 bg-blue-500/5 border-blue-500/10" },
          { title: "Available Units", value: localSummary.available, icon: Sparkles, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
          { title: "Reserved Units", value: reservedCount, icon: Calendar, color: "text-[#C9A84C] bg-amber-500/5 border-amber-500/10" },
          { title: "Active Trips", value: activeCalculated, icon: Activity, color: "text-[#3B82F6] bg-blue-500/5 border-blue-500/10" },
          { title: "Detailing/Cleaning", value: localSummary.detailing, icon: Sparkles, color: "text-purple-400 bg-purple-500/5 border-purple-500/10" },
          { title: "In Maintenance", value: localSummary.maintenance, icon: Wrench, color: "text-red-400 bg-red-500/5 border-red-500/10" },
          { title: "Inactive/Hidden", value: localSummary.inactive, icon: XCircle, color: "text-slate-400 bg-slate-500/5 border-slate-500/10" }
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className={`border rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl h-[120px] ${item.color}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase font-bold text-white/30 tracking-wider block max-w-[80px] leading-tight">
                {item.title}
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 shrink-0" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black text-white mt-2 block font-mono leading-none">
                {item.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters Panel */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-white/40" />
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Search & Filters</h3>
          </div>
          
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search registration, brand, ID..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Brand Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Brand</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Brands</option>
              {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Fuel Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Fuel Type</label>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Fuels</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Transmission Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Transmission</label>
            <select
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Gearboxes</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
              <option value="coming_soon">Coming Soon</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-white/40">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Locations</option>
              {locationOptions.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/[0.01] border border-white/10 rounded-2xl gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSelectAll} 
            className="text-white/40 hover:text-white flex items-center gap-1 text-xs font-semibold"
          >
            {selectedIds.length === filteredVehicles.length && filteredVehicles.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-500" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Select All ({selectedIds.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmationAction("mark_available")}
            disabled={selectedIds.length === 0}
            className="text-[9px] uppercase font-bold py-1.5 h-auto rounded-lg"
          >
            Mark Available
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmationAction("send_to_cleaning")}
            disabled={selectedIds.length === 0}
            className="text-[9px] uppercase font-bold py-1.5 h-auto rounded-lg text-purple-400 border-purple-500/20"
          >
            Send to Cleaning
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmationAction("send_to_maintenance")}
            disabled={selectedIds.length === 0}
            className="text-[9px] uppercase font-bold py-1.5 h-auto rounded-lg text-red-400 border-red-500/10"
          >
            Send to Maint
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmationAction("disable")}
            disabled={selectedIds.length === 0}
            className="text-[9px] uppercase font-bold py-1.5 h-auto rounded-lg text-slate-400 border-slate-500/20"
          >
            Disable
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            className="text-[9px] uppercase font-bold py-1.5 h-auto rounded-lg flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 border-none"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Fleet Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.map((v) => {
          const isSelected = selectedIds.includes(v.id);
          return (
            <div 
              key={v.id} 
              className={`group rounded-3xl border transition-all overflow-hidden flex flex-col justify-between relative ${
                isSelected 
                  ? "bg-blue-600/[0.03] border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "bg-white/[0.01] border-white/10 hover:bg-white/[0.02] hover:border-blue-500/25"
              }`}
            >
              {/* Checkbox Overlay */}
              <button 
                onClick={() => handleToggleSelect(v.id)}
                className="absolute top-4 right-4 z-20 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/15 text-white/50 hover:text-white"
              >
                {isSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
              </button>

              <div className="h-44 relative bg-[#090a0f] overflow-hidden">
                <img 
                  src={getVehicleImage(v)} 
                  alt={`${v.brand} ${v.model}`} 
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border ${getStatusColor(v.availability_status)}`}>
                    {v.availability_status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/60 backdrop-blur-sm text-[9px] text-white/60 font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                    {v.metadata?.location || "Main Office"}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-extrabold text-sm">{v.brand} {v.model}</h3>
                      <span className="text-[10px] text-white/40 block mt-0.5">{v.category?.name || "General Fleet"}</span>
                    </div>
                    <span className="text-[#3B82F6] font-bold text-xs">{formatINR(v.daily_rate)}/day</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 mt-4 text-[10px] font-mono text-white/60">
                    <div className="space-y-1">
                      <span className="text-white/30 text-[8px] block uppercase">Registration</span>
                      <span className="uppercase font-bold text-white/80">{v.registration_number}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-white/30 text-[8px] block uppercase">Cleanliness</span>
                      <span className={`font-bold flex items-center gap-1 ${getCleanlinessColor(v.cleanliness_status)}`}>
                        ● {v.cleanliness_status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-white/30 text-[8px] block uppercase">Mileage</span>
                      <span className="font-bold text-white/80 flex items-center gap-1"><Gauge className="w-3 h-3 text-white/30" /> {v.current_odometer.toLocaleString()} KM</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-white/30 text-[8px] block uppercase">Fuel & Gear</span>
                      <span className="font-bold text-white/80">{v.fuel_type} • {v.transmission[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-[9px] uppercase font-bold py-2 h-auto rounded-xl"
                    onClick={() => setSelectedId(v.id)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-[9px] uppercase font-bold py-2 h-auto rounded-xl disabled:opacity-20"
                    disabled
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-[9px] uppercase font-bold py-2 h-auto rounded-xl disabled:opacity-20"
                    disabled
                  >
                    History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-[9px] uppercase font-bold py-2 h-auto rounded-xl disabled:opacity-20"
                    disabled
                  >
                    Maintenance
                  </Button>
                </div>
              </div>

            </div>
          );
        })}
        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-16 text-center text-white/30 font-mono italic">
            No matching vehicles found in fleet catalog index.
          </div>
        )}
      </div>

      {/* ─── READ-ONLY DETAILS SIDE DRAWER ─── */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 z-50 flex justify-end select-none">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
              onClick={() => setSelectedId(null)} 
            />
            
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="w-full max-w-xl bg-[#0c0d10] border-l border-white/10 h-full relative z-10 flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-6">
                
                {/* Header panel */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-[#3B82F6] uppercase tracking-wider">Registry Code: {selectedVehicle.registration_number}</span>
                    <h3 className="text-white text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{selectedVehicle.brand} {selectedVehicle.model}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Specs Cards */}
                <div className="grid grid-cols-4 gap-3 text-center text-xs font-mono">
                  <div className="bg-[#090a0f] p-3 rounded-xl border border-white/5">
                    <span className="text-white/30 text-[8px] uppercase block">Year</span>
                    <span className="text-white font-bold block mt-0.5">{selectedVehicle.year}</span>
                  </div>
                  <div className="bg-[#090a0f] p-3 rounded-xl border border-white/5">
                    <span className="text-white/30 text-[8px] uppercase block">Fuel Type</span>
                    <span className="text-white font-bold block mt-0.5">{selectedVehicle.fuel_type}</span>
                  </div>
                  <div className="bg-[#090a0f] p-3 rounded-xl border border-white/5">
                    <span className="text-white/30 text-[8px] uppercase block">Gearbox</span>
                    <span className="text-white font-bold block mt-0.5">{selectedVehicle.transmission}</span>
                  </div>
                  <div className="bg-[#090a0f] p-3 rounded-xl border border-white/5">
                    <span className="text-white/30 text-[8px] uppercase block">Rate</span>
                    <span className="text-white font-bold block mt-0.5">{formatINR(selectedVehicle.daily_rate)}</span>
                  </div>
                </div>

                {/* Booking History & Revenue */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-[#3B82F6]" /> Booking History</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Total Revenue: {formatINR(totalRevenue)}</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar font-mono text-[10px]">
                    {loadingDetails ? (
                      <div className="text-white/30 italic">Loading reservation history...</div>
                    ) : bookingHistory.length > 0 ? (
                      bookingHistory.map((b) => (
                        <div key={b.id} className="flex justify-between items-center p-2 rounded bg-white/[0.01] border border-white/5">
                          <div>
                            <span className="text-[#3B82F6] font-bold block">#{b.booking_reference}</span>
                            <span className="text-white/30 text-[8px]">{b.user ? `${b.user.first_name} ${b.user.last_name}` : "Unknown"}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-bold block">{formatINR(b.total_amount)}</span>
                            <span className="text-[8px] text-white/40 uppercase">{b.booking_status}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/20 italic p-2 text-center">No historical bookings recorded.</div>
                    )}
                  </div>
                </div>

                {/* Maintenance Logs */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-purple-400" /> Maintenance Logs</span>
                    <span className="text-[10px] text-purple-400 font-mono font-bold">Logs: {maintenanceLogs.length}</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar font-mono text-[10px]">
                    {loadingDetails ? (
                      <div className="text-white/30 italic">Loading maintenance history...</div>
                    ) : maintenanceLogs.length > 0 ? (
                      maintenanceLogs.map((log) => (
                        <div key={log.id} className="p-2 rounded bg-white/[0.01] border border-white/5 text-left space-y-1">
                          <div className="flex justify-between text-white/40">
                            <span>{log.service_type.replace(/_/g, " ").toUpperCase()}</span>
                            <span>{new Date(log.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-white font-semibold">{log.details || "No details provided"}</p>
                          <div className="flex justify-between text-[8px] text-white/30">
                            <span>Odo: {log.odometer?.toLocaleString()} KM</span>
                            <span>Cost: {formatINR(log.cost)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/20 italic p-2 text-center">No service history logs found.</div>
                    )}
                  </div>
                </div>

                {/* Vital Health & Expiries (RC, Insurance, PUC, Fastag) */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block font-sans">Legal Documentations & Expiries</span>
                  
                  {loadingDetails ? (
                    <div className="text-[10px] text-white/30 font-mono py-4">Syncing vital indicators...</div>
                  ) : healthDetails ? (
                    <div className="space-y-2.5 text-xs font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/50 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Insurance Valid Until:</span>
                        <span className="text-white">{new Date(healthDetails.insurance_expiry).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/50 flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-emerald-400" /> Registration Certificate:</span>
                        <span className="text-white">{new Date(healthDetails.rc_expiry).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/50 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-purple-400" /> Pollution Certificate (PUC):</span>
                        <span className="text-white">{new Date(healthDetails.puc_expiry).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/50 flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-amber-400" /> GPS Track Coordinates:</span>
                        <span className="text-white">{selectedVehicle.metadata?.gps_coordinates || "19.0760° N, 72.8777° E"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/50 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-[#3B82F6]" /> FASTag Balance:</span>
                        <span className="text-[#3B82F6] font-bold">{formatINR(healthDetails.fastag_balance)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-white/30 font-mono italic py-4">No legal documentation expiries logged for this unit.</div>
                  )}
                </div>

                {/* Audit Logs Trail Timeline inside Drawer */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block font-sans">Operation Audit Trails</span>
                  <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar font-mono text-[9px] text-white/60">
                    {selectedVehicle.metadata?.audit_trail && selectedVehicle.metadata.audit_trail.length > 0 ? (
                      selectedVehicle.metadata.audit_trail.map((log: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-blue-500/30 pl-3 space-y-0.5">
                          <div className="flex justify-between text-white/30">
                            <span>{log.user}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-white font-semibold capitalize">Action: {log.action.replace(/_/g, " ")}</p>
                          <div className="text-white/40">
                            <span>Change: {log.old_value} ➔ {log.new_value}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/20 italic text-center py-2">No modification audits logged for this vehicle profile.</div>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={() => setSelectedId(null)}
                  variant="outline"
                  className="rounded-xl text-[10px] uppercase font-bold px-6 py-2 h-auto"
                >
                  Close Drawer
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog Modal overlay */}
      <AnimatePresence>
        {confirmationAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmationAction(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0d10] border border-white/10 p-6 rounded-3xl w-full max-w-sm relative z-10 space-y-5 text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Confirm Operation</h4>
                <p className="text-white/50 text-xs leading-relaxed">
                  Are you sure you want to perform bulk action <span className="text-[#3B82F6] font-bold capitalize">"{confirmationAction.replace(/_/g, " ")}"</span> for the {selectedIds.length} selected vehicles? Every change is audited server-side.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmationAction(null)}
                  className="flex-1 rounded-xl text-[10px] uppercase font-bold py-2 h-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExecuteBulkAction}
                  className="flex-1 rounded-xl text-[10px] uppercase font-bold py-2 h-auto bg-red-600 hover:bg-red-500 border-none"
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
