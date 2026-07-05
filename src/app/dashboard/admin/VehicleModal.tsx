"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Vehicle, VehicleCategory } from "@/types/database";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0f1e] border border-white/[0.08] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <h2 className="text-xl font-black text-white">{isEditMode ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Basic Info */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Registration No *</label>
                <input required type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" placeholder="e.g. GA03 AB 1234" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Category *</label>
                <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors cursor-pointer appearance-none">
                  <option value="" className="bg-[#0a0f1e]">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0a0f1e]">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Brand *</label>
                <input required type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" placeholder="e.g. BMW" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Model *</label>
                <input required type="text" name="model" value={formData.model} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" placeholder="e.g. X5" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Variant (Optional)</label>
                <input type="text" name="variant" value={formData.variant} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" placeholder="e.g. xDrive40i" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Year *</label>
                <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>

              {/* Specs */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Fuel Type *</label>
                <select required name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors cursor-pointer appearance-none">
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(f => (
                    <option key={f} value={f} className="bg-[#0a0f1e]">{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Transmission *</label>
                <select required name="transmission" value={formData.transmission} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors cursor-pointer appearance-none">
                  {['Automatic', 'Manual'].map(t => (
                    <option key={t} value={t} className="bg-[#0a0f1e]">{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Seating Cap *</label>
                <input required type="number" name="seating_capacity" value={formData.seating_capacity} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Luggage Cap</label>
                <input type="number" name="luggage_capacity" value={formData.luggage_capacity} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>

              {/* Pricing */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Daily Rate (₹) *</label>
                <input required type="number" name="daily_rate" value={formData.daily_rate} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Hourly Rate (₹) *</label>
                <input required type="number" name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Security Deposit (₹) *</label>
                <input required type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/[0.08] flex justify-end gap-3 bg-[#060b18]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            form="vehicle-form"
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-black bg-[#c9a84c] text-[#0a0f1e] hover:bg-[#e8c96d] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Vehicle")}
          </button>
        </div>
      </div>
    </div>
  );
}
