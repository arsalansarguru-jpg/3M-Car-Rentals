"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Vehicle, VehicleCategory } from "@/types/database";
import { Button } from "@/components/ui/Button";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: VehicleCategory[];
  vehicle?: Vehicle; // If provided, we are in Edit mode
  onSaved: (savedVehicle: Vehicle) => void;
}

export default function VehicleModal({ isOpen, onClose, categories, vehicle, onSaved }: VehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState(() => {
    if (vehicle) {
      return {
        registration_number: vehicle.registration_number || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        variant: vehicle.variant || "",
        year: vehicle.year || new Date().getFullYear(),
        category_id: vehicle.category_id || "",
        fuel_type: vehicle.fuel_type || "Petrol",
        transmission: vehicle.transmission || "Automatic",
        seating_capacity: vehicle.seating_capacity || 5,
        luggage_capacity: vehicle.luggage_capacity ?? 2,
        hourly_rate: Number(vehicle.hourly_rate) || 0,
        daily_rate: Number(vehicle.daily_rate) || 0,
        security_deposit: Number(vehicle.security_deposit) || 0,
      };
    }
    return {
      registration_number: "",
      brand: "",
      model: "",
      variant: "",
      year: new Date().getFullYear(),
      category_id: "",
      fuel_type: "Petrol",
      transmission: "Automatic",
      seating_capacity: 5,
      luggage_capacity: 2,
      hourly_rate: 0,
      daily_rate: 0,
      security_deposit: 0,
    };
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;

    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      registration_number: formData.registration_number,
      brand: formData.brand,
      model: formData.model,
      variant: formData.variant || null,
      year: formData.year,
      category_id: formData.category_id,
      fuel_type: formData.fuel_type,
      transmission: formData.transmission,
      seating_capacity: formData.seating_capacity,
      luggage_capacity: formData.luggage_capacity || null,
      hourly_rate: formData.hourly_rate,
      daily_rate: formData.daily_rate,
      security_deposit: formData.security_deposit,
      availability_status: vehicle?.availability_status || "available",
    };

    try {
      let data, dbError;
      if (vehicle) {
        // Edit mode
        const res = await supabase
          .from("vehicles")
          .update(payload)
          .eq("id", vehicle.id)
          .select(`
            id, registration_number, brand, model, variant, year, category_id,
            fuel_type, transmission, seating_capacity, luggage_capacity,
            hourly_rate, daily_rate, security_deposit, availability_status,
            category:vehicle_categories (name, slug)
          `)
          .single();
        data = res.data;
        dbError = res.error;
      } else {
        // Add mode
        const res = await supabase
          .from("vehicles")
          .insert([payload])
          .select(`
            id, registration_number, brand, model, variant, year, category_id,
            fuel_type, transmission, seating_capacity, luggage_capacity,
            hourly_rate, daily_rate, security_deposit, availability_status,
            category:vehicle_categories (name, slug)
          `)
          .single();
        data = res.data;
        dbError = res.error;
      }

      if (dbError) {
        throw new Error(dbError.message);
      }

      if (!data) {
        throw new Error("No data returned from database");
      }
      onSaved(data as unknown as Vehicle);
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to save vehicle";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!vehicle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass-modal w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-[20px] bg-[#121210]/95 backdrop-blur-[24px] border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 style={{ fontFamily: "var(--font-urbanist)", fontSize: "1.25rem", fontWeight: 500, color: "#ffffff" }}>{isEditMode ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors cursor-pointer p-2 hover:bg-white/5 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 rounded-[20px] bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Basic Info */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Registration No *</label>
                <input required type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-white/20" placeholder="e.g. GA03 AB 1234" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Category *</label>
                <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer [color-scheme:dark]">
                  <option value="" className="bg-[#121210] text-[#E8DCC8]/30">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#121210]">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Brand *</label>
                <input required type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-white/20" placeholder="e.g. BMW" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Model *</label>
                <input required type="text" name="model" value={formData.model} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-white/20" placeholder="e.g. X5" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Variant (Optional)</label>
                <input type="text" name="variant" value={formData.variant} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-white/20" placeholder="e.g. xDrive40i" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Year *</label>
                <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
              </div>

              {/* Specs */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Fuel Type *</label>
                <select required name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer [color-scheme:dark]">
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => (
                    <option key={f} value={f} className="bg-[#121210]">{f}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Transmission *</label>
                <select required name="transmission" value={formData.transmission} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer [color-scheme:dark]">
                  {['Automatic', 'Manual'].map(t => (
                    <option key={t} value={t} className="bg-[#121210]">{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Seating Cap *</label>
                <input required type="number" name="seating_capacity" value={formData.seating_capacity} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Luggage Cap</label>
                <input type="number" name="luggage_capacity" value={formData.luggage_capacity} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
              </div>

              {/* Pricing */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Daily Rate (₹) *</label>
                <input required type="number" name="daily_rate" value={formData.daily_rate} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Hourly Rate (₹) *</label>
                <input required type="number" name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[#E8DCC8]/60 text-[10px] font-semibold uppercase tracking-[0.14em]">Security Deposit (₹) *</label>
                <input required type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange} className="w-full bg-white/[0.08] border border-white/12 rounded-[20px] px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all" />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            variant="outline"
            className="rounded-[20px]"
          >
            Cancel
          </Button>
          <Button
            form="vehicle-form"
            type="submit"
            disabled={loading}
            variant="primary"
            className="rounded-[20px]"
          >
            {loading ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Vehicle")}
          </Button>
        </div>
      </div>
    </div>
  );
}
