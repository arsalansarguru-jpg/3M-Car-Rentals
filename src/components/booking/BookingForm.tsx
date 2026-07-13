"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { VehicleWithCategory } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Info,
  DollarSign,
  HeartHandshake,
  Loader,
  Clock,
  Sparkles,
  FileSignature
} from "lucide-react";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return (
    "3M-" +
    Array.from({ length: 8 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("")
  );
}

const LOCATIONS = [
  "Goa International Airport (GOI) — Dabolim",
  "Manohar International Airport (GOX) — Mopa",
  "Panjim City Centre",
  "Calangute Beach Area",
  "Baga / Candolim",
  "Anjuna / Vagator",
  "Margao City",
  "Mapusa Town"
];

interface BookingFormProps {
  vehicle: VehicleWithCategory;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  type: "daily" | "once";
  description: string;
}

const AVAILABLE_ADDONS: Addon[] = [
  { id: "chauffeur", name: "Prestige Chauffeur", price: 2999, type: "daily", description: "Professional English-speaking uniforms driver" },
  { id: "gps", name: "Premium GPS Navigation", price: 499, type: "daily", description: "Offline local route guides & offline charts" },
  { id: "child_seat", name: "Infant Safety Seat", price: 399, type: "daily", description: "Premium side-impact protected child seats" },
  { id: "airport_valet", name: "Curbside Airport Valet", price: 1500, type: "once", description: "Direct terminal handover & priority parking" }
];

export default function BookingForm({ vehicle }: BookingFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupMethod, setPickupMethod] = useState<"Office" | "Airport" | "Hotel" | "Home Delivery">("Office");
  
  // Custom states
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [insuranceTier, setInsuranceTier] = useState<"Basic" | "Premium" | "Zero-Deductible">("Basic");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  
  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  // Live price calculations
  const pricingBreakdown = useMemo(() => {
    if (!pickupDate || !returnDate) return null;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return null;

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);

    // Vehicle base amount
    const baseVehicleAmount = diffDays * (vehicle.daily_rate || 5000);

    // Add-on calculations
    let addonsTotal = 0;
    selectedAddons.forEach(addonId => {
      const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
      if (addon) {
        if (addon.type === "daily") {
          addonsTotal += addon.price * diffDays;
        } else {
          addonsTotal += addon.price;
        }
      }
    });

    // Insurance calculations
    let insuranceTotal = 0;
    if (insuranceTier === "Premium") {
      insuranceTotal = 999 * diffDays;
    } else if (insuranceTier === "Zero-Deductible") {
      insuranceTotal = 1999 * diffDays;
    }

    const subtotal = baseVehicleAmount + addonsTotal + insuranceTotal;
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;
    const depositAmount = insuranceTier === "Zero-Deductible" ? 2500 : insuranceTier === "Premium" ? 5000 : 10000;

    return { 
      diffDays, 
      baseVehicleAmount, 
      addonsTotal, 
      insuranceTotal, 
      subtotal, 
      taxAmount, 
      totalAmount,
      depositAmount 
    };
  }, [pickupDate, returnDate, vehicle, selectedAddons, insuranceTier]);

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!pickup || !dropoff || !pickupDate || !returnDate) {
        setError("Please enter pickup locations and date range.");
        return;
      }
      if (new Date(returnDate) <= new Date(pickupDate)) {
        setError("Return date must be after pickup date.");
        return;
      }
    }
    if (step === 4) {
      if (!policyAccepted || !signatureName) {
        setError("Please check policy approvals and input your electronic signature.");
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmitBooking = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=${encodeURIComponent(`/fleet/${vehicle.id}`)}`);
        return;
      }

      // Fetch user profile
      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (!userRow) {
        setError("User profile details missing.");
        setSubmitting(false);
        return;
      }

      // Check KYC status - optional blocker or warning
      const { data: userProfile } = await supabase
        .from("users")
        .select("kyc_status")
        .eq("id", userRow.id)
        .single();
      
      const reference = genRef();
      const prepChecklist = { cleaning: false, fuel: false, inspection: false };
      
      const { error: insertError } = await supabase
        .from("bookings")
        .insert({
          booking_reference: reference,
          user_id: userRow.id,
          vehicle_id: vehicle.id,
          pickup_location: pickup,
          return_location: dropoff,
          pickup_datetime: pickupDate,
          return_datetime: returnDate,
          booking_status: "pending",
          payment_status: "pending",
          total_amount: pricingBreakdown?.totalAmount || 0,
          deposit_amount: pricingBreakdown?.depositAmount || 10000,
          pickup_method: pickupMethod,
          insurance_tier: insuranceTier,
          addons: selectedAddons,
          signature_accepted: true,
          preparation_checklist: prepChecklist,
          internal_notes: `Booking initialized with ${insuranceTier} cover. Signature Accept Name: ${signatureName}`,
          audit_trail: [
            {
              action: "created",
              timestamp: new Date().toISOString(),
              verifier: "Customer Client Portal",
              note: "Reservation initialized & digital agreement signed."
            }
          ]
        });

      if (insertError) throw insertError;

      setSuccessRef(reference);
      setStep(5);

    } catch (err: any) {
      setError(err.message || "Booking dispatch failed. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 16);

  return (
    <div className="rounded-[30px] p-6 bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden space-y-6">
      
      {/* Dynamic ambient header background */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#00e5ff] to-blue-600" />
      
      {/* ── Progress Indicators ── */}
      {step < 5 && (
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-[#00e5ff] font-bold">Step {step} of 4</span>
            <h3 className="text-white text-base font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
              {step === 1 ? "Schedule & Route" : 
               step === 2 ? "Select Prestige Extras" : 
               step === 3 ? "Select Protection Layer" : 
               "Accept Agreement"}
            </h3>
          </div>
          
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`w-5 h-1 rounded-full transition-all ${
                  step >= s ? "bg-[#00e5ff]" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{error}</div>}

      <AnimatePresence mode="wait">
        
        {/* Step 1: Schedule & Route */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            {/* Pickup Method */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Pickup Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Office", "Airport", "Hotel", "Home Delivery"].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPickupMethod(method as any)}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      pickupMethod === method 
                        ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                        : "bg-[#090a0f]/40 border-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Pickup Location</label>
                <select
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Select location...</option>
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Return Location</label>
                <select
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Select location...</option>
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Return Date & Time
                </label>
                <input
                  type="datetime-local"
                  min={pickupDate || todayStr}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-[#090a0f] border border-white/10 rounded-xl py-3 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleNextStep} variant="fleet" className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2">
                Continue Booking <ArrowRight className="w-4.5 h-4.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Extras */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div className="space-y-3">
              {AVAILABLE_ADDONS.map(addon => {
                const active = selectedAddons.includes(addon.id);
                return (
                  <div 
                    key={addon.id}
                    onClick={() => handleAddonToggle(addon.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      active 
                        ? "bg-blue-600/10 border-blue-500/30" 
                        : "bg-[#090a0f]/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <h4 className="text-white text-sm font-bold flex items-center gap-1.5">
                        {addon.name}
                      </h4>
                      <p className="text-white/40 text-xs mt-0.5">{addon.description}</p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="text-white text-sm font-extrabold">{formatINR(addon.price)}</span>
                        <span className="text-[10px] text-white/30 block">{addon.type === "daily" ? "/ day" : "one-time"}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        active ? "bg-blue-500 border-blue-500 text-black" : "border-white/20"
                      }`}>
                        {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={handleNextStep} variant="fleet" className="flex-1 rounded-xl flex items-center justify-center gap-1.5">Next <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Protection Cover */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-left"
          >
            <div className="grid grid-cols-1 gap-3">
              {[
                { 
                  id: "Basic", 
                  title: "Basic Liability", 
                  price: 0, 
                  desc: "Standard commercial insurance with deductible deposit limit ₹10,000 in case of accident.", 
                  badge: "Standard" 
                },
                { 
                  id: "Premium", 
                  title: "Premium Protection", 
                  price: 999, 
                  desc: "Reduces maximum deposit liability to ₹5,000. Covers tire cuts and standard windshield cracks.", 
                  badge: "Recommended" 
                },
                { 
                  id: "Zero-Deductible", 
                  title: "Zero-Deductible Cover", 
                  price: 1999, 
                  desc: "Zero liability for paint scuffs or panel crash repairs. Security deposit reduced to ₹2,500.", 
                  badge: "Complete VIP Shield" 
                }
              ].map(tier => {
                const active = insuranceTier === tier.id;
                return (
                  <div 
                    key={tier.id}
                    onClick={() => setInsuranceTier(tier.id as any)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
                      active 
                        ? "bg-blue-600/10 border-blue-500/30" 
                        : "bg-[#090a0f]/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {active && <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-500" />}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-sm font-bold">{tier.title}</h4>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          active ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-white/5 border-white/10 text-white/40"
                        }`}>{tier.badge}</span>
                      </div>
                      <p className="text-white/40 text-xs max-w-md">{tier.desc}</p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="text-white text-sm font-extrabold">{tier.price === 0 ? "Included" : formatINR(tier.price)}</span>
                        {tier.price > 0 && <span className="text-[10px] text-white/30 block">/ day</span>}
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        active ? "bg-blue-500 border-blue-500 text-black" : "border-white/20"
                      }`}>
                        {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={handleNextStep} variant="fleet" className="flex-1 rounded-xl flex items-center justify-center gap-1.5">Next <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Checklist & Agreement */}
        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5 text-left"
          >
            {/* Live Pricing Breakdown Summary */}
            {pricingBreakdown && (
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2 text-xs">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider block">Prestige Rate Breakdown</span>
                
                <div className="flex justify-between">
                  <span className="text-white/50">Base vehicle rent ({pricingBreakdown.diffDays} Days):</span>
                  <span className="text-white font-mono">{formatINR(pricingBreakdown.baseVehicleAmount)}</span>
                </div>
                {pricingBreakdown.addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Prestige Addons:</span>
                    <span className="text-white font-mono">{formatINR(pricingBreakdown.addonsTotal)}</span>
                  </div>
                )}
                {pricingBreakdown.insuranceTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Insurance Premium cover:</span>
                    <span className="text-white font-mono">{formatINR(pricingBreakdown.insuranceTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">GST state logistics (18%):</span>
                  <span className="text-white font-mono">{formatINR(pricingBreakdown.taxAmount)}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-white font-bold text-sm">Grand Total amount:</span>
                  <span className="text-blue-400 font-mono text-base font-black">{formatINR(pricingBreakdown.totalAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-white/40 pt-1">
                  <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Refundable Security Deposit:</span>
                  <span className="font-mono text-white/60 font-semibold">{formatINR(pricingBreakdown.depositAmount)}</span>
                </div>
              </div>
            )}

            {/* Checklist checks */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#090a0f]/40 border border-white/5 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyAccepted}
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0"
                />
                <span>I confirm that the driving licence holder is 25+ years old and matches the profile verification portraits.</span>
              </label>
            </div>

            {/* Rental Agreement Sign box */}
            <div className="space-y-2.5">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Electronic Signature Acceptance</label>
              <div className="relative">
                <FileSignature className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Type your full legal name to sign agreement..."
                  className="w-full bg-[#090a0f] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button 
                onClick={handleSubmitBooking} 
                disabled={submitting} 
                variant="fleet" 
                className="flex-1 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Finalizing Booking...
                  </>
                ) : (
                  <>
                    Complete Booking & Pay <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Succession & Prep Timeline */}
        {step === 5 && (
          <motion.div
            key="step-5"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 text-center py-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-white text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Booking Confirmed</h3>
              <p className="text-white/40 text-xs">Reference: <span className="font-mono text-white/60 font-semibold">#{successRef}</span></p>
            </div>

            {/* Vehicle Preparation Tracker */}
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-left space-y-4 max-w-sm mx-auto">
              <span className="text-[9px] uppercase tracking-wider text-white/30 block font-bold">Vehicle Preparation Tracker</span>
              
              <div className="space-y-4 relative pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                
                <div className="relative">
                  <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)]" />
                  <div className="text-[11px] font-bold text-white">Stage 1: Cleaning & Detailing</div>
                  <p className="text-[9px] text-white/40 leading-normal mt-0.5">Interior vacuum detailing & body polish in progress.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-white/10" />
                  <div className="text-[11px] font-bold text-white/40">Stage 2: Fueling Check</div>
                  <p className="text-[9px] text-white/20 leading-normal mt-0.5">Refueling tank and topping fluid reservoirs.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-white/10" />
                  <div className="text-[11px] font-bold text-white/40">Stage 3: Safety Inspection</div>
                  <p className="text-[9px] text-white/20 leading-normal mt-0.5">Brake pads, tire health metrics & document logs checkout.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-white/10" />
                  <div className="text-[11px] font-bold text-white/40">Stage 4: Handover Delivery</div>
                  <p className="text-[9px] text-white/20 leading-normal mt-0.5">Vehicle key dispatch at selected pickup point.</p>
                </div>

              </div>
            </div>

            <div className="pt-4 flex flex-col gap-2 max-w-sm mx-auto">
              <Button onClick={() => router.push("/dashboard")} variant="fleet" className="w-full rounded-xl">Go to Dashboard</Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
