"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  MapPin,
  Tag,
  ShieldCheck,
  Bell
} from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  category: string;
  daily_rate: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  image: string;
  is_displayed: boolean;
  is_featured: boolean;
  availability_status: string;
  features?: string[];
}

interface Booking {
  id: string;
  car_id: string;
  car_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_location: string;
  pickup_date: string;
  pickup_time: string;
  return_date: string;
  total_days: number;
  total_amount: number;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

export default function SimplifiedAdminPage() {
  const [activeTab, setActiveTab] = useState<"fleet-display" | "bookings" | "car-management">("bookings");
  
  // Data states
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Booking filters & search
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [bookingSearch, setBookingSearch] = useState<string>("");

  // Car Management Modal
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Vehicle | null>(null);
  const [carForm, setCarForm] = useState({
    name: "",
    category: "suv",
    daily_rate: 2500,
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Petrol",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
    is_displayed: true,
    is_featured: false,
    availability_status: "available",
  });

  useEffect(() => {
    loadCars();
    loadBookings();
    
    // Poll bookings every 15 seconds for live alerts
    const interval = setInterval(loadBookings, 15000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(""), 3500);
  };

  const loadCars = async () => {
    try {
      setLoadingCars(true);
      const res = await fetch("/api/fleet");
      const data = await res.json();
      if (data.success && Array.isArray(data.cars)) {
        setCars(data.cars);
      }
    } catch (err) {
      console.error("Error loading fleet:", err);
    } finally {
      setLoadingCars(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // 1. Toggle Fleet Displayed
  const toggleCarVisibility = async (car: Vehicle) => {
    const updatedStatus = !car.is_displayed;
    try {
      const res = await fetch("/api/fleet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: car.id, is_displayed: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCars((prev) =>
          prev.map((c) => (c.id === car.id ? { ...c, is_displayed: updatedStatus } : c))
        );
        showToast(`${car.name} is now ${updatedStatus ? "VISIBLE on website" : "HIDDEN from website"}`);
      }
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    }
  };

  const toggleCarFeatured = async (car: Vehicle) => {
    const updatedFeatured = !car.is_featured;
    try {
      const res = await fetch("/api/fleet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: car.id, is_featured: updatedFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setCars((prev) =>
          prev.map((c) => (c.id === car.id ? { ...c, is_featured: updatedFeatured } : c))
        );
        showToast(`${car.name} featured status updated`);
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  // 2. Update Booking Status
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: status as any } : b))
        );
        showToast(`Booking ${bookingId} status changed to ${status.toUpperCase()}`);
      }
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  // 3. Save / Edit / Delete Cars
  const openAddCarModal = () => {
    setEditingCar(null);
    setCarForm({
      name: "",
      category: "suv",
      daily_rate: 2500,
      seats: 5,
      transmission: "Automatic",
      fuel_type: "Petrol",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
      is_displayed: true,
      is_featured: false,
      availability_status: "available",
    });
    setIsCarModalOpen(true);
  };

  const openEditCarModal = (car: Vehicle) => {
    setEditingCar(car);
    setCarForm({
      name: car.name,
      category: car.category,
      daily_rate: car.daily_rate,
      seats: car.seats,
      transmission: car.transmission,
      fuel_type: car.fuel_type,
      image: car.image,
      is_displayed: car.is_displayed,
      is_featured: car.is_featured,
      availability_status: car.availability_status,
    });
    setIsCarModalOpen(true);
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carForm.name.trim()) return;

    try {
      if (editingCar) {
        // Update
        const res = await fetch("/api/fleet", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCar.id, ...carForm }),
        });
        const data = await res.json();
        if (data.success) {
          setCars((prev) =>
            prev.map((c) => (c.id === editingCar.id ? { ...c, ...carForm } : c))
          );
          showToast(`Updated vehicle: ${carForm.name}`);
        }
      } else {
        // Create
        const res = await fetch("/api/fleet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(carForm),
        });
        const data = await res.json();
        if (data.success) {
          setCars((prev) => [data.car, ...prev]);
          showToast(`Added new vehicle: ${carForm.name}`);
        }
      }
      setIsCarModalOpen(false);
    } catch (err) {
      console.error("Failed to save car:", err);
    }
  };

  const handleDeleteCar = async (carId: string, carName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${carName} from fleet inventory?`)) return;

    try {
      const res = await fetch(`/api/fleet?id=${carId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCars((prev) => prev.filter((c) => c.id !== carId));
        showToast(`Deleted ${carName} from inventory`);
      }
    } catch (err) {
      console.error("Failed to delete car:", err);
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingFilter === "all" || b.status === bookingFilter;
    const matchesSearch =
      bookingSearch.trim() === "" ||
      b.customer_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customer_phone.includes(bookingSearch) ||
      b.car_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingBookingsCount = bookings.filter((b) => b.status === "pending").length;
  const visibleCarsCount = cars.filter((c) => c.is_displayed).length;

  return (
    <div className="min-h-screen bg-[#0F0E0C] text-[#E8DCC8]">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl bg-[#C9A84C] text-[#121210] font-semibold text-sm shadow-2xl animate-bounce flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#161512] sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C] text-[#121210] font-bold text-lg flex items-center justify-center">
              3M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">3M Car Rentals Owner Portal</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 uppercase">
                  Owner View
                </span>
              </div>
              <p className="text-xs text-zinc-400">Manage Fleet Visibility • Client Bookings • Car Inventory</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/10 transition"
            >
              <span>View Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => {
                loadCars();
                loadBookings();
                showToast("Refreshed data!");
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The 3 Core Tabs Requested */}
        <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-2 overflow-x-auto border-t border-white/5 pt-1">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2.5 transition whitespace-nowrap ${
              activeTab === "bookings"
                ? "border-[#C9A84C] text-[#C9A84C]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Client Bookings</span>
            {pendingBookingsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                {pendingBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("fleet-display")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2.5 transition whitespace-nowrap ${
              activeTab === "fleet-display"
                ? "border-[#C9A84C] text-[#C9A84C]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Fleet Displayed</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
              {visibleCarsCount}/{cars.length} Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab("car-management")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2.5 transition whitespace-nowrap ${
              activeTab === "car-management"
                ? "border-[#C9A84C] text-[#C9A84C]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Car Management</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
              {cars.length} Cars
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* =========================================================================
            TAB 1: CLIENT BOOKINGS
        ========================================================================= */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#161512] border border-white/8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "All Bookings" },
                  { id: "pending", label: "Pending Requests" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "completed", label: "Completed" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                      bookingFilter === f.id
                        ? "bg-[#C9A84C] text-[#121210] font-semibold"
                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search customer, phone, car..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            {/* Bookings List */}
            {loadingBookings ? (
              <div className="text-center py-20 text-zinc-400">Loading client bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 rounded-2xl bg-[#161512] border border-white/5 space-y-2">
                <Calendar className="w-12 h-12 text-[#C9A84C] mx-auto opacity-70" />
                <h3 className="text-lg font-semibold text-white">No Bookings Found</h3>
                <p className="text-xs text-zinc-400">
                  {bookingFilter !== "all"
                    ? `No bookings with status "${bookingFilter}".`
                    : "Incoming customer booking requests will appear here in real-time."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBookings.map((b) => {
                  const whatsappClientText = encodeURIComponent(
                    `Hello ${b.customer_name}, this is 3M Car Rentals Goa regarding your booking ${b.id} for the ${b.car_name} from ${b.pickup_date} to ${b.return_date}. We have received your request!`
                  );
                  const clientWhatsappUrl = `https://api.whatsapp.com/send?phone=${b.customer_phone.replace(/[^0-9]/g, "")}&text=${whatsappClientText}`;

                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-[#161512] border border-white/8 hover:border-[#C9A84C]/30 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    >
                      {/* Left: Customer & Car Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded border border-[#C9A84C]/20">
                            {b.id}
                          </span>

                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                              b.status === "pending"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : b.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : b.status === "completed"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            ● {b.status}
                          </span>

                          <span className="text-xs text-zinc-500">
                            {new Date(b.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-1">
                          <div>
                            <span className="text-xs text-zinc-500 block">Customer</span>
                            <span className="text-base font-bold text-white">{b.customer_name}</span>
                          </div>

                          <div>
                            <span className="text-xs text-zinc-500 block">Vehicle</span>
                            <span className="text-sm font-semibold text-[#E8DCC8]">{b.car_name}</span>
                          </div>

                          <div>
                            <span className="text-xs text-zinc-500 block">Pickup Location</span>
                            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                              {b.pickup_location}
                            </span>
                          </div>

                          <div>
                            <span className="text-xs text-zinc-500 block">Rental Dates</span>
                            <span className="text-xs font-medium text-zinc-300">
                              {b.pickup_date} ({b.pickup_time}) → {b.return_date} ({b.total_days} Days)
                            </span>
                          </div>
                        </div>

                        {b.notes && (
                          <p className="text-xs text-zinc-400 bg-black/30 p-2 rounded-lg border border-white/5 max-w-2xl">
                            <span className="text-zinc-500 font-semibold">Note:</span> {b.notes}
                          </p>
                        )}
                      </div>

                      {/* Right: Pricing & Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                        <div className="text-right">
                          <span className="text-xs text-zinc-400 block">Total Est. Amount</span>
                          <span className="text-xl font-bold text-[#C9A84C]">
                            ₹{b.total_amount?.toLocaleString("en-IN") || "N/A"}
                          </span>
                        </div>

                        {/* Status Switcher & Contact Actions */}
                        <div className="flex items-center gap-2">
                          <select
                            value={b.status}
                            onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                            className="px-3 py-1.5 text-xs bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C9A84C]"
                          >
                            <option value="pending">Mark Pending</option>
                            <option value="confirmed">Confirm Booking</option>
                            <option value="completed">Complete Rental</option>
                            <option value="cancelled">Cancel</option>
                          </select>

                          <a
                            href={clientWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white transition"
                            title="Chat with Customer on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          <a
                            href={`tel:${b.customer_phone}`}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
                            title="Call Customer"
                          >
                            <Phone className="w-4 h-4 text-[#C9A84C]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: FLEET DISPLAYED (Public Visibility & Highlighting)
        ========================================================================= */}
        {activeTab === "fleet-display" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#161512] border border-white/8 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Public Website Display Controls</h3>
                <p className="text-xs text-zinc-400">
                  Instantly toggle which cars are shown to customers on the homepage and fleet pages.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Active On Site</span>
                <span className="text-lg font-bold text-[#C9A84C]">
                  {visibleCarsCount} of {cars.length} Cars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className={`p-5 rounded-2xl bg-[#161512] border transition-all ${
                    car.is_displayed
                      ? "border-[#C9A84C]/40 shadow-lg shadow-[#C9A84C]/5"
                      : "border-white/5 opacity-60 bg-[#121210]"
                  }`}
                >
                  <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-black/40">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          car.is_displayed
                            ? "bg-emerald-500 text-black font-semibold"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {car.is_displayed ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug">{car.name}</h4>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider">{car.category}</span>
                      </div>
                      <span className="text-base font-bold text-[#C9A84C]">₹{car.daily_rate}/d</span>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-300">Show on Website</span>
                      <button
                        onClick={() => toggleCarVisibility(car)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${
                          car.is_displayed ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            car.is_displayed ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-300">Feature on Homepage</span>
                      <button
                        onClick={() => toggleCarFeatured(car)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${
                          car.is_featured ? "bg-[#C9A84C]" : "bg-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            car.is_featured ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CAR MANAGEMENT (Add, Edit, Delete Inventory)
        ========================================================================= */}
        {activeTab === "car-management" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Fleet Inventory</h3>
                <p className="text-xs text-zinc-400">Add new vehicles, update prices, transmission, and specs.</p>
              </div>

              <button
                onClick={openAddCarModal}
                className="px-5 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add New Car
              </button>
            </div>

            {/* Car Inventory Table */}
            <div className="rounded-2xl bg-[#161512] border border-white/8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#121210] text-zinc-400 text-xs uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Vehicle</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Daily Rate</th>
                      <th className="py-3 px-4">Specs</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cars.map((car) => (
                      <tr key={car.id} className="hover:bg-white/2 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={car.image}
                              alt={car.name}
                              className="w-12 h-9 object-cover rounded-lg border border-white/10"
                            />
                            <div>
                              <span className="font-semibold text-white block">{car.name}</span>
                              <span className="text-[11px] text-zinc-500 font-mono">{car.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 uppercase text-xs font-medium text-zinc-300">
                          {car.category}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#C9A84C]">
                          ₹{car.daily_rate.toLocaleString("en-IN")}/day
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-300">
                          {car.seats} Seats • {car.transmission} • {car.fuel_type}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              car.is_displayed
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {car.is_displayed ? "Live on site" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditCarModal(car)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                              title="Edit Vehicle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car.id, car.name)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition"
                              title="Delete Vehicle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL: ADD / EDIT CAR
      ========================================================================= */}
      {isCarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-[#171614] border border-[#C9A84C]/30 rounded-2xl p-6 shadow-2xl text-[#E8DCC8]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingCar ? `Edit ${editingCar.name}` : "Add New Vehicle to Fleet"}
              </h3>
              <button
                onClick={() => setIsCarModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Vehicle Name & Model *</label>
                <input
                  type="text"
                  required
                  value={carForm.name}
                  onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                  placeholder="e.g. Mahindra Thar 4x4 Petrol"
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                  <select
                    value={carForm.category}
                    onChange={(e) => setCarForm({ ...carForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="suv">SUV / 4x4</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="sedan">Sedan</option>
                    <option value="muv">MUV / 7-Seater</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Daily Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={carForm.daily_rate}
                    onChange={(e) => setCarForm({ ...carForm, daily_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Seats</label>
                  <input
                    type="number"
                    value={carForm.seats}
                    onChange={(e) => setCarForm({ ...carForm, seats: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Transmission</label>
                  <select
                    value={carForm.transmission}
                    onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Fuel Type</label>
                  <select
                    value={carForm.fuel_type}
                    onChange={(e) => setCarForm({ ...carForm, fuel_type: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={carForm.image}
                  onChange={(e) => setCarForm({ ...carForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={carForm.is_displayed}
                    onChange={(e) => setCarForm({ ...carForm, is_displayed: e.target.checked })}
                    className="rounded border-white/20 bg-black/40 text-[#C9A84C] focus:ring-0"
                  />
                  <span>Display on Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={carForm.is_featured}
                    onChange={(e) => setCarForm({ ...carForm, is_featured: e.target.checked })}
                    className="rounded border-white/20 bg-black/40 text-[#C9A84C] focus:ring-0"
                  />
                  <span>Featured Badge</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCarModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#C9A84C] text-[#121210] hover:bg-[#D4B55E] transition"
                >
                  {editingCar ? "Save Changes" : "Create Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
