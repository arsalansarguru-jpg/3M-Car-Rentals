"use client";

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Calendar, 
  Sparkles, 
  Check,
  Percent,
  Lock
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  daily_rate: number;
  hourly_rate: number;
  security_deposit: number;
  pricing_options?: {
    weekend_rate?: number;
    weekly_rate?: number;
    monthly_rate?: number;
    half_day_rate?: number;
    peak_season_rate?: number;
    off_season_rate?: number;
    festival_rate?: number;
  };
}

export default function PricingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form rates states
  const [hourlyRate, setHourlyRate] = useState(0);
  const [dailyRate, setDailyRate] = useState(0);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  
  // Advanced rates states
  const [halfDayRate, setHalfDayRate] = useState(0);
  const [weekendRate, setWeekendRate] = useState(0);
  const [weeklyRate, setWeeklyRate] = useState(0);
  const [monthlyRate, setMonthlyRate] = useState(0);
  const [peakSeasonRate, setPeakSeasonRate] = useState(0);
  const [offSeasonRate, setOffSeasonRate] = useState(0);
  const [festivalRate, setFestivalRate] = useState(0);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (res.ok && data.vehicles) {
        setVehicles(data.vehicles);
        if (data.vehicles.length > 0) {
          const first = data.vehicles[0];
          setSelectedVehicleId(first.id);
          loadVehicleRates(first);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleRates = (v: Vehicle) => {
    setHourlyRate(v.hourly_rate || 0);
    setDailyRate(v.daily_rate || 0);
    setSecurityDeposit(v.security_deposit || 0);
    
    const opts = v.pricing_options || {};
    setHalfDayRate(opts.half_day_rate || 0);
    setWeekendRate(opts.weekend_rate || 0);
    setWeeklyRate(opts.weekly_rate || 0);
    setMonthlyRate(opts.monthly_rate || 0);
    setPeakSeasonRate(opts.peak_season_rate || 0);
    setOffSeasonRate(opts.off_season_rate || 0);
    setFestivalRate(opts.festival_rate || 0);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      loadVehicleRates(vehicle);
    }
  };

  const handleSavePricing = async () => {
    if (!selectedVehicleId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedVehicleId,
          hourly_rate: Number(hourlyRate),
          daily_rate: Number(dailyRate),
          security_deposit: Number(securityDeposit),
          pricing_options: {
            half_day_rate: Number(halfDayRate),
            weekend_rate: Number(weekendRate),
            weekly_rate: Number(weeklyRate),
            monthly_rate: Number(monthlyRate),
            peak_season_rate: Number(peakSeasonRate),
            off_season_rate: Number(offSeasonRate),
            festival_rate: Number(festivalRate),
          }
        })
      });
      if (res.ok) {
        // Update local state list
        setVehicles(vehicles.map(v => v.id === selectedVehicleId ? {
          ...v,
          hourly_rate: Number(hourlyRate),
          daily_rate: Number(dailyRate),
          security_deposit: Number(securityDeposit),
          pricing_options: {
            half_day_rate: Number(halfDayRate),
            weekend_rate: Number(weekendRate),
            weekly_rate: Number(weeklyRate),
            monthly_rate: Number(monthlyRate),
            peak_season_rate: Number(peakSeasonRate),
            off_season_rate: Number(offSeasonRate),
            festival_rate: Number(festivalRate),
          }
        } : v));
        alert("Pricing rates and overrides updated successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Revenue optimization
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Pricing & Rate Configurations
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Define flexible base rates, weekend surcharges, and seasonal pricing tiers.
          </p>
        </div>

        <Button variant="fleet" size="sm" onClick={handleSavePricing} disabled={saving || !selectedVehicleId}>
          <Check className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Rate Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left selector */}
        <div className="space-y-6">
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Select Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="glass-input px-3.5 py-2.5 text-white bg-transparent border border-white/10 rounded-xl focus:outline-none"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-[#0f1115]">
                    {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>
          </GlassCard>

          <GlassCard className="p-5 text-xs text-white/50 space-y-3">
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "#ffffff" }} className="flex items-center gap-1">
              <Percent className="w-4 h-4 text-cyan-400" /> Surcharges mapping
            </h4>
            <p>
              Weekend and festival rates override base daily rates during designated intervals. Weekly and monthly flat rates apply automatically at booking checkout.
            </p>
          </GlassCard>
        </div>

        {/* Right workspace */}
        <div className="lg:col-span-3 space-y-6">
          {/* Base rates */}
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.25rem" }}>
              Standard Base Rates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Hourly Rate</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 bg-white/5 mt-2">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm font-semibold p-2.5"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Daily Rate *</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 bg-white/5 mt-2">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm font-semibold p-2.5"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Security Deposit *</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 bg-white/5 mt-2">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm font-semibold p-2.5"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Long term rates */}
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.25rem" }}>
              Long-term & Special Rates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Half Day Rate</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 mt-1.5">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={halfDayRate}
                    onChange={(e) => setHalfDayRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm p-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Weekend Daily</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 mt-1.5">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={weekendRate}
                    onChange={(e) => setWeekendRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm p-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Weekly Flat</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 mt-1.5">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={weeklyRate}
                    onChange={(e) => setWeeklyRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm p-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Monthly Flat</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 mt-1.5">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm p-2"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Seasonal surcharges */}
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.25rem" }}>
              Seasonal & Festival Overrides
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Peak Season Rate</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 mt-1.5">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={peakSeasonRate}
                    onChange={(e) => setPeakSeasonRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm p-2"
                  />
                </div>
                <span className="text-[9px] text-white/30 block mt-1">December 15 - January 10</span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Off-Season Rate</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 mt-1.5">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={offSeasonRate}
                    onChange={(e) => setOffSeasonRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm p-2"
                  />
                </div>
                <span className="text-[9px] text-white/30 block mt-1">June 1 - August 31 (Monsoon)</span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">Festival Surcharge</span>
                <div className="flex items-center border border-white/10 rounded-xl px-3 mt-1.5">
                  <span className="text-white/40 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    value={festivalRate}
                    onChange={(e) => setFestivalRate(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-sm p-2"
                  />
                </div>
                <span className="text-[9px] text-white/30 block mt-1">Ganesh Chaturthi, Diwali, Easter</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
