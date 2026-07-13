"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Car, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Check, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Star,
  CheckSquare,
  AlertCircle,
  FileText,
  DollarSign
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  registration_number: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  category_id: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: number;
  luggage_capacity: number | null;
  hourly_rate: number;
  daily_rate: number;
  security_deposit: number;
  availability_status: string;
  created_at: string;
  
  // Metadata extensions
  color?: string;
  vin?: string;
  odometer?: number;
  mileage?: string;
  engine?: string;
  doors?: number;
  boot_capacity?: string;
  description?: string;
  highlights?: string[];
  features?: string[];
  images?: string[];
  featured_image?: string;
  featured?: boolean;
  is_visible?: boolean;
  pricing_options?: {
    weekend_rate?: number;
    weekly_rate?: number;
    monthly_rate?: number;
    half_day_rate?: number;
    peak_season_rate?: number;
    off_season_rate?: number;
  };
  documents?: any[];
  maintenance?: any[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function VehicleInventoryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Bulk action states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form values
  const [formValues, setFormValues] = useState<Partial<Vehicle>>({});
  const [formHighlightsText, setFormHighlightsText] = useState("");
  
  // Tabs in edit form
  const [activeFormTab, setActiveFormTab] = useState<"basic" | "features" | "pricing">("basic");

  const checklistOptions = [
    "ABS", "Airbags", "Apple CarPlay", "Android Auto", "Sunroof", "Cruise Control",
    "360 Camera", "GPS", "Bluetooth", "Fast Charger", "Ventilated Seats", 
    "Leather Seats", "Push Start", "Reverse Camera", "Automatic Climate Control"
  ];

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (res.ok) {
        setVehicles(data.vehicles || []);
      } else {
        setError(data.error || "Failed to load inventory");
      }
      
      // Load categories
      const catRes = await fetch("/api/customer-360"); // using existing APIs or fallback
      // Custom fallback list since we know the categories
      setCategories([
        { id: "hatchback", name: "Hatchback", slug: "hatchback" },
        { id: "sedan", name: "Sedan", slug: "sedan" },
        { id: "suv", name: "SUV", slug: "suv" },
        { id: "luxury", name: "Luxury", slug: "luxury" },
        { id: "premium-suv", name: "Premium SUV", slug: "premium-suv" },
      ]);
    } catch (err: any) {
      setError(err.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Sync state with query param for immediate adding
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      handleAddNew();
      // Remove query param to avoid repeat opening
      router.replace("/dashboard/admin/fleet-management/inventory");
    }
  }, [searchParams]);

  // Handler for adding new vehicle
  const handleAddNew = () => {
    setEditingVehicle(null);
    setFormValues({
      brand: "",
      model: "",
      variant: "",
      year: 2024,
      category_id: "suv",
      fuel_type: "Petrol",
      transmission: "Automatic",
      seating_capacity: 5,
      luggage_capacity: 3,
      hourly_rate: 250,
      daily_rate: 2500,
      security_deposit: 5000,
      availability_status: "available",
      color: "",
      vin: "",
      odometer: 0,
      mileage: "",
      engine: "",
      doors: 5,
      boot_capacity: "",
      description: "",
      highlights: [],
      features: [],
      images: [],
      featured_image: "",
      featured: false,
      is_visible: true,
      pricing_options: {
        weekend_rate: 3000,
        weekly_rate: 15000,
        monthly_rate: 55000,
        half_day_rate: 1500,
        peak_season_rate: 3500,
        off_season_rate: 1800,
      }
    });
    setFormHighlightsText("");
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  // Handler for editing vehicle
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormValues({ ...vehicle });
    setFormHighlightsText((vehicle.highlights || []).join("\n"));
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  // Handler for duplicating vehicle
  const handleDuplicate = async (vehicle: Vehicle) => {
    try {
      const dup = {
        ...vehicle,
        registration_number: `${vehicle.registration_number}-COPY`,
        id: undefined // will generate new UUID
      };
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dup)
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for deleting vehicle
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/vehicles?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for bulk price update
  const handleBulkPriceUpdate = async () => {
    const rate = prompt("Enter new daily rate to apply to selected vehicles:");
    if (!rate || isNaN(Number(rate))) return;
    try {
      setLoading(true);
      for (const id of selectedIds) {
        await fetch("/api/vehicles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, daily_rate: Number(rate) })
        });
      }
      setSelectedIds([]);
      fetchInventory();
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for bulk feature toggle
  const handleBulkFeature = async (featured: boolean) => {
    try {
      setLoading(true);
      for (const id of selectedIds) {
        await fetch("/api/vehicles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, featured })
        });
      }
      setSelectedIds([]);
      fetchInventory();
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} vehicles?`)) return;
    try {
      setLoading(true);
      for (const id of selectedIds) {
        await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
      }
      setSelectedIds([]);
      fetchInventory();
    } catch (e) {
      console.error(e);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const highlights = formHighlightsText.split("\n").map(s => s.trim()).filter(Boolean);
      const payload = {
        ...formValues,
        highlights
      };
      
      const method = editingVehicle ? "PUT" : "POST";
      const res = await fetch("/api/vehicles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsFormOpen(false);
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save vehicle details");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckboxChange = (feature: string) => {
    const current = formValues.features || [];
    const next = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    setFormValues({ ...formValues, features: next });
  };

  // Filter computation
  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = 
      `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()) ||
      v.registration_number.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !filterBrand || v.brand.toLowerCase() === filterBrand.toLowerCase();
    const matchStatus = !filterStatus || v.availability_status === filterStatus;
    
    return matchSearch && matchBrand && matchStatus;
  });

  const uniqueBrands = Array.from(new Set(vehicles.map(v => v.brand)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Fleet Management
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Vehicle Inventory
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Configure vehicle specs, set flexible rates, and manage visual galleries.
          </p>
        </div>

        <Button variant="fleet" size="sm" onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      {/* Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by brand, model or plate…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 pr-4 py-2 text-white text-sm focus:outline-none placeholder:text-white/30"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="glass-input px-3 py-2 text-white text-sm bg-transparent border border-white/10 rounded-xl focus:outline-none"
          >
            <option value="" className="bg-[#0f1115]">All Brands</option>
            {uniqueBrands.map(b => (
              <option key={b} value={b} className="bg-[#0f1115]">{b}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input px-3 py-2 text-white text-sm bg-transparent border border-white/10 rounded-xl focus:outline-none"
          >
            <option value="" className="bg-[#0f1115]">All Statuses</option>
            <option value="available" className="bg-[#0f1115]">Available</option>
            <option value="reserved" className="bg-[#0f1115]">Booked</option>
            <option value="maintenance" className="bg-[#0f1115]">Maintenance</option>
          </select>
        </div>
      </GlassCard>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-xl p-3.5 flex items-center justify-between animate-fadeIn text-sm">
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "#00e5ff" }}>
            {selectedIds.length} {selectedIds.length === 1 ? "vehicle" : "vehicles"} selected
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleBulkPriceUpdate}>
              Update Rate
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleBulkFeature(true)}>
              Feature
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleBulkFeature(false)}>
              Unfeature
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-white/40">
              Clear
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-white/40">Querying fleet registry…</div>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="py-4 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredVehicles.length && filteredVehicles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredVehicles.map(v => v.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-white/20 bg-transparent text-[#00e5ff] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">Thumbnail</th>
                  <th className="py-4 px-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">Details</th>
                  <th className="py-4 px-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">Specs</th>
                  <th className="py-4 px-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">Daily Price</th>
                  <th className="py-4 px-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">Status</th>
                  <th className="py-4 px-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">Badges</th>
                  <th className="py-4 px-4 text-right text-white/40 uppercase tracking-widest text-[10px] font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredVehicles.map(vehicle => {
                  const isSelected = selectedIds.includes(vehicle.id);
                  const imageSrc = vehicle.featured_image || (vehicle.images && vehicle.images[0]) || null;
                  
                  return (
                    <tr key={vehicle.id} className={`glass-table-row transition-all ${isSelected ? 'bg-white/[0.03]' : ''}`}>
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, vehicle.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== vehicle.id));
                            }
                          }}
                          className="rounded border-white/20 bg-transparent text-[#00e5ff] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-14 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative shrink-0">
                          {imageSrc ? (
                            <img src={imageSrc} className="w-full h-full object-cover" alt="Car Thumbnail" />
                          ) : (
                            <Car className="w-5 h-5 text-white/20" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">{vehicle.registration_number}</div>
                      </td>
                      <td className="py-4 px-4 text-xs text-white/60">
                        <div>{vehicle.transmission} · {vehicle.fuel_type}</div>
                        <div className="text-white/30 mt-0.5">{vehicle.seating_capacity} Seats · {vehicle.year}</div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-white">
                        ₹{vehicle.daily_rate.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${
                          vehicle.availability_status === "available" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          vehicle.availability_status === "reserved" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                          "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {vehicle.availability_status}
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        {vehicle.featured && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] font-bold uppercase mr-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> Featured
                          </span>
                        )}
                        {vehicle.is_visible !== false ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                            Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/30 text-[9px] font-bold uppercase">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 text-white/50 hover:text-white rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(vehicle)}
                            className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 text-white/50 hover:text-white rounded-lg transition-all"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-white/50 hover:text-red-400 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredVehicles.length === 0 && (
              <div className="py-14 text-center text-white/35">No inventory matches filter criteria.</div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Slide-out Add / Edit Vehicle Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl h-full glass-modal rounded-none border-l border-white/10 flex flex-col justify-between animate-slideLeft shadow-2xl relative">
            
            {/* Form Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f1115]/80">
              <div>
                <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase">
                  {editingVehicle ? "Update Registry" : "New Entry"}
                </span>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", marginTop: "0.25rem" }}>
                  {editingVehicle ? `Edit ${editingVehicle.brand} ${editingVehicle.model}` : "Add Vehicle to Fleet"}
                </h2>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-white/40 hover:text-white p-2 hover:bg-white/5 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Navigation Tabs */}
            <div className="flex border-b border-white/5 px-6 gap-4 text-xs font-semibold uppercase tracking-wider text-white/30 bg-[#0f1115]/40">
              <button
                onClick={() => setActiveFormTab("basic")}
                className={`py-3.5 border-b-2 transition-all ${activeFormTab === "basic" ? "border-[#00e5ff] text-[#00e5ff]" : "border-transparent hover:text-white"}`}
              >
                Basic details
              </button>
              <button
                onClick={() => setActiveFormTab("features")}
                className={`py-3.5 border-b-2 transition-all ${activeFormTab === "features" ? "border-[#00e5ff] text-[#00e5ff]" : "border-transparent hover:text-white"}`}
              >
                Features Checklist
              </button>
              <button
                onClick={() => setActiveFormTab("pricing")}
                className={`py-3.5 border-b-2 transition-all ${activeFormTab === "pricing" ? "border-[#00e5ff] text-[#00e5ff]" : "border-transparent hover:text-white"}`}
              >
                Pricing schedules
              </button>
            </div>

            {/* Form Content body */}
            <form id="inventory-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeFormTab === "basic" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Brand *</label>
                      <input
                        type="text"
                        required
                        value={formValues.brand || ""}
                        onChange={(e) => setFormValues({ ...formValues, brand: e.target.value })}
                        placeholder="e.g. Audi"
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Model *</label>
                      <input
                        type="text"
                        required
                        value={formValues.model || ""}
                        onChange={(e) => setFormValues({ ...formValues, model: e.target.value })}
                        placeholder="e.g. A6"
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Variant</label>
                      <input
                        type="text"
                        value={formValues.variant || ""}
                        onChange={(e) => setFormValues({ ...formValues, variant: e.target.value })}
                        placeholder="e.g. Technology TFSI"
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Registration No. *</label>
                      <input
                        type="text"
                        required
                        value={formValues.registration_number || ""}
                        onChange={(e) => setFormValues({ ...formValues, registration_number: e.target.value })}
                        placeholder="e.g. GA-03-A-9011"
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Year *</label>
                      <input
                        type="number"
                        required
                        value={formValues.year || 2024}
                        onChange={(e) => setFormValues({ ...formValues, year: Number(e.target.value) })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Color</label>
                      <input
                        type="text"
                        value={formValues.color || ""}
                        onChange={(e) => setFormValues({ ...formValues, color: e.target.value })}
                        placeholder="Nexa Blue"
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Odometer (km)</label>
                      <input
                        type="number"
                        value={formValues.odometer || 0}
                        onChange={(e) => setFormValues({ ...formValues, odometer: Number(e.target.value) })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Fuel Type</label>
                      <select
                        value={formValues.fuel_type || "Petrol"}
                        onChange={(e) => setFormValues({ ...formValues, fuel_type: e.target.value })}
                        className="glass-input px-3.5 py-2.5 text-white bg-transparent border border-white/10 rounded-xl focus:outline-none"
                      >
                        <option value="Petrol" className="bg-[#0f1115]">Petrol</option>
                        <option value="Diesel" className="bg-[#0f1115]">Diesel</option>
                        <option value="Electric" className="bg-[#0f1115]">Electric</option>
                        <option value="Hybrid" className="bg-[#0f1115]">Hybrid</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Transmission</label>
                      <select
                        value={formValues.transmission || "Automatic"}
                        onChange={(e) => setFormValues({ ...formValues, transmission: e.target.value })}
                        className="glass-input px-3.5 py-2.5 text-white bg-transparent border border-white/10 rounded-xl focus:outline-none"
                      >
                        <option value="Automatic" className="bg-[#0f1115]">Automatic</option>
                        <option value="Manual" className="bg-[#0f1115]">Manual</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Seats</label>
                      <input
                        type="number"
                        value={formValues.seating_capacity || 5}
                        onChange={(e) => setFormValues({ ...formValues, seating_capacity: Number(e.target.value) })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">VIN Number</label>
                      <input
                        type="text"
                        value={formValues.vin || ""}
                        onChange={(e) => setFormValues({ ...formValues, vin: e.target.value })}
                        placeholder="Vehicle identification number"
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Location / Base Station</label>
                      <input
                        type="text"
                        value={formValues.boot_capacity || ""} // placeholder base metadata
                        onChange={(e) => setFormValues({ ...formValues, boot_capacity: e.target.value })}
                        placeholder="Panaji, Goa"
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Brief Description</label>
                    <textarea
                      value={formValues.description || ""}
                      onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                      placeholder="Write a premium synopsis of the vehicle..."
                      rows={3}
                      className="glass-input p-3.5 text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Highlights (One per line)</label>
                    <textarea
                      value={formHighlightsText}
                      onChange={(e) => setFormHighlightsText(e.target.value)}
                      placeholder="High commanding view&#10;Bang & Olufsen 3D Sound&#10;Sunroof & Ambient Lighting"
                      rows={3}
                      className="glass-input p-3.5 text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={!!formValues.featured}
                        onChange={(e) => setFormValues({ ...formValues, featured: e.target.checked })}
                        className="rounded border-white/20 bg-transparent text-[#00e5ff] focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <label htmlFor="featured" className="text-xs text-white/60 select-none cursor-pointer">
                        Featured/VIP Highlight
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_visible"
                        checked={formValues.is_visible !== false}
                        onChange={(e) => setFormValues({ ...formValues, is_visible: e.target.checked })}
                        className="rounded border-white/20 bg-transparent text-[#00e5ff] focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <label htmlFor="is_visible" className="text-xs text-white/60 select-none cursor-pointer">
                        Visible on Public Website
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === "features" && (
                <div className="space-y-4">
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)" }}>
                    Select convenience and driving features available on this unit:
                  </p>
                  <div className="grid grid-cols-2 gap-3.5">
                    {checklistOptions.map(opt => {
                      const isChecked = (formValues.features || []).includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => handleCheckboxChange(opt)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked 
                              ? "bg-[#00e5ff]/5 border-[#00e5ff]/35 text-white" 
                              : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]"
                          }`}
                        >
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500 }}>{opt}</span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isChecked ? "bg-[#00e5ff] border-[#00e5ff] text-[#0f1115]" : "border-white/20"
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeFormTab === "pricing" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Base Daily Rate (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formValues.daily_rate || 0}
                        onChange={(e) => setFormValues({ ...formValues, daily_rate: Number(e.target.value) })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Security Deposit (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formValues.security_deposit || 0}
                        onChange={(e) => setFormValues({ ...formValues, security_deposit: Number(e.target.value) })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Hourly Rate (₹)</label>
                      <input
                        type="number"
                        value={formValues.hourly_rate || 0}
                        onChange={(e) => setFormValues({ ...formValues, hourly_rate: Number(e.target.value) })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Weekend Daily Rate (₹)</label>
                      <input
                        type="number"
                        value={formValues.pricing_options?.weekend_rate || 0}
                        onChange={(e) => setFormValues({
                          ...formValues,
                          pricing_options: { ...formValues.pricing_options, weekend_rate: Number(e.target.value) }
                        })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Weekly Flat Rate (₹)</label>
                      <input
                        type="number"
                        value={formValues.pricing_options?.weekly_rate || 0}
                        onChange={(e) => setFormValues({
                          ...formValues,
                          pricing_options: { ...formValues.pricing_options, weekly_rate: Number(e.target.value) }
                        })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Monthly Flat Rate (₹)</label>
                      <input
                        type="number"
                        value={formValues.pricing_options?.monthly_rate || 0}
                        onChange={(e) => setFormValues({
                          ...formValues,
                          pricing_options: { ...formValues.pricing_options, monthly_rate: Number(e.target.value) }
                        })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Peak Season Rate (₹)</label>
                      <input
                        type="number"
                        value={formValues.pricing_options?.peak_season_rate || 0}
                        onChange={(e) => setFormValues({
                          ...formValues,
                          pricing_options: { ...formValues.pricing_options, peak_season_rate: Number(e.target.value) }
                        })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Off-Season Rate (₹)</label>
                      <input
                        type="number"
                        value={formValues.pricing_options?.off_season_rate || 0}
                        onChange={(e) => setFormValues({
                          ...formValues,
                          pricing_options: { ...formValues.pricing_options, off_season_rate: Number(e.target.value) }
                        })}
                        className="glass-input px-3.5 py-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Form Footer */}
            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0f1115]/80">
              <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-white/50">
                Cancel
              </Button>
              <Button variant="fleet" onClick={handleFormSubmit}>
                Save Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VehicleInventoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0b0d]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Loading Inventory Dashboard...</p>
        </div>
      </div>
    }>
      <VehicleInventoryPageContent />
    </Suspense>
  );
}
