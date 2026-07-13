"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Car, 
  Calendar, 
  MapPin, 
  Wallet, 
  ShieldAlert, 
  Award, 
  UserCheck, 
  AlertOctagon, 
  FileText, 
  PhoneCall, 
  ArrowUpRight, 
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  daily_rate: number;
  fuel_type: string;
  transmission: string;
  category: { name: string } | null;
}

interface Booking {
  id: string;
  booking_reference: string;
  pickup_location: string;
  return_location: string;
  pickup_datetime: string;
  return_datetime: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
  vehicle: Vehicle | null;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [kycStatus, setKycStatus] = useState<"not_started" | "under_review" | "approved" | "action_required">("not_started");
  const [completionPercent, setCompletionPercent] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState<"Silver" | "Gold" | "Platinum" | "Black">("Silver");
  const [emergencyContact, setEmergencyContact] = useState<any>(null);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedVehicles, setRecommendedVehicles] = useState<Vehicle[]>([]);
  const [walletBalance, setWalletBalance] = useState(5000);

  // KYC Checklist progress checks
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [govtIdUploaded, setGovtIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [addressUploaded, setAddressUploaded] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        // Fetch User Info
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (profile) {
          setFirstName(profile.first_name || "Guest");
          setLastName(profile.last_name || "Member");
          setKycStatus(profile.kyc_status || "not_started");
          setCompletionPercent(profile.profile_completed_percent || 0);
          setLoyaltyTier(profile.loyalty_tier || "Silver");
          setPreferredCategories(profile.preferred_categories || []);
          
          if (profile.emergency_contact_name) {
            setEmergencyContact({
              name: profile.emergency_contact_name,
              phone: profile.emergency_contact_phone,
              relation: profile.emergency_contact_relationship
            });
          }

          // Fetch Bookings
          const { data: bookingsData } = await supabase
            .from("bookings")
            .select(`*, vehicle:vehicles(id, brand, model, variant, year, daily_rate)`)
            .eq("user_id", profile.id)
            .order("pickup_datetime", { ascending: false });
          
          if (bookingsData) {
            setBookings(bookingsData as any);
          }

          // Fetch KYC detail checklist
          const { data: licenseData } = await supabase
            .from("driver_licenses")
            .select("*")
            .eq("user_id", profile.id)
            .maybeSingle();
          
          if (licenseData) {
            setLicenseUploaded(!!(licenseData.license_front_url && licenseData.license_back_url));
            setGovtIdUploaded(!!licenseData.govt_id_url);
            setSelfieUploaded(!!licenseData.selfie_url);
            setAddressUploaded(!!licenseData.address_proof_url);
          }

          // Fetch vehicles and use category matching for AI Recommendations
          const { data: vehicles } = await supabase
            .from("vehicles")
            .select("*, category:vehicle_categories(name)")
            .limit(10);
          
          if (vehicles) {
            // Filter by user's preferred categories
            const matched = vehicles.filter((v: any) => 
              profile.preferred_categories?.includes(v.category?.name || "")
            );
            
            // Fallback to top vehicles if no matching preferences are set yet
            if (matched.length > 0) {
              setRecommendedVehicles(matched.slice(0, 3) as any);
            } else {
              setRecommendedVehicles(vehicles.slice(0, 3) as any);
            }
          }
        }

      } catch (err) {
        console.error("Dashboard Loading Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/40 text-xs uppercase tracking-widest font-mono">Simulating Prestige Portal...</p>
      </div>
    );
  }

  // Active / Upcoming Rental
  const activeBooking = bookings.find(b => ["confirmed", "active", "ready_for_pickup"].includes(b.booking_status));

  // Build Checklist Items
  const checklistItems = [
    { label: "Provide Contact Details", checked: !!firstName && !!lastName },
    { label: "Upload Driver License Scans", checked: licenseUploaded },
    { label: "Attach Government ID Copy", checked: govtIdUploaded },
    { label: "Complete Identity Verification Selfie", checked: selfieUploaded },
    { label: "Attach Utility Bill Address Proof", checked: addressUploaded },
    { label: "Submit Preferences & Emergencies", checked: !!emergencyContact }
  ];

  // Loyalty Tier Card Styling
  const getTierGradient = (tier: string) => {
    switch (tier) {
      case "Black":
        return {
          bg: "from-[#1a1b20] via-[#090a0f] to-[#2c2d35]",
          text: "text-white/90",
          accent: "text-white/50",
          shadow: "shadow-[0_0_20px_rgba(255,255,255,0.05)]",
          glow: "border-white/10"
        };
      case "Platinum":
        return {
          bg: "from-[#29323c] via-[#485563] to-[#2b5876]",
          text: "text-[#e2e8f0]",
          accent: "text-blue-300",
          shadow: "shadow-[0_0_20px_rgba(148,163,184,0.15)]",
          glow: "border-white/20"
        };
      case "Gold":
        return {
          bg: "from-[#a07c11] via-[#c9a84c] to-[#e8dcc8]/70",
          text: "text-slate-900 font-extrabold",
          accent: "text-slate-800",
          shadow: "shadow-[0_0_20px_rgba(201,168,76,0.2)]",
          glow: "border-[#c9a84c]/30"
        };
      default:
        return {
          bg: "from-[#3e3b3b] via-[#6e6868] to-[#918787]",
          text: "text-white",
          accent: "text-slate-200",
          shadow: "shadow-md",
          glow: "border-white/5"
        };
    }
  };

  const tierStyle = getTierGradient(loyaltyTier);

  return (
    <div className="space-y-8 font-sans">
      
      {/* ─── Header: Greeting & Loyalty Card ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Personalized Greeting */}
        <div className="lg:col-span-2 rounded-[30px] p-8 overflow-hidden bg-gradient-to-br from-blue-900/10 via-[#00e5ff]/5 to-transparent border border-white/5 shadow-2xl flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#00e5ff] text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} /> Goa VIP Club Access
            </span>
            <h1 className="text-white text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
              Welcome back, {firstName}
            </h1>
            <p className="text-white/40 text-sm mt-1 max-w-md" style={{ fontFamily: "var(--font-manrope)" }}>
              Experience the absolute pinnacle of self-drive luxury. Your selected model is fully detailed.
            </p>
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/5 mt-6">
            <Link href="/fleet">
              <Button variant="fleet" className="rounded-xl px-5 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                Browse Fleet <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Loyalty Tier metal card */}
        <div className={`rounded-[30px] p-6 bg-gradient-to-br ${tierStyle.bg} ${tierStyle.glow} border ${tierStyle.shadow} flex flex-col justify-between min-h-[200px] relative overflow-hidden`}>
          {/* Card branding */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] uppercase tracking-widest block font-bold opacity-60">3M Membership Card</span>
              <p className={`text-xl font-bold tracking-wider mt-1 ${tierStyle.text}`} style={{ fontFamily: "var(--font-urbanist)" }}>
                {loyaltyTier} Privilege
              </p>
            </div>
            <Award className={`w-8 h-8 ${tierStyle.accent}`} />
          </div>

          {/* Card owner */}
          <div className="flex justify-between items-end mt-8 relative z-10">
            <div>
              <span className="text-[8px] uppercase tracking-widest block opacity-50">Card Holder</span>
              <p className={`text-sm font-semibold tracking-wide ${tierStyle.text}`} style={{ fontFamily: "var(--font-urbanist)" }}>
                {firstName} {lastName}
              </p>
            </div>
            <span className="text-[10px] font-mono opacity-50">Active Since 2026</span>
          </div>
        </div>

      </div>

      {/* ─── Onboarding & Verification Status Card ─── */}
      <div className="rounded-[30px] p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
        
        {kycStatus === "approved" ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5">
                  Identity Verified
                </h3>
                <p className="text-white/40 text-xs mt-0.5 max-w-lg">
                  Congratulations! Your KYC records have been validated. You can check out and secure vehicle keys instantly without safety deposits.
                </p>
              </div>
            </div>
            <Link href="/fleet">
              <Button variant="fleet" size="sm">Book Premium Ride</Button>
            </Link>
          </div>
        ) : kycStatus === "under_review" ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: "8s" }} />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-lg">Verification Under Review</h3>
                  <p className="text-white/40 text-xs mt-0.5">
                    Our verification concierge is checking your document uploads. Estimated remaining wait time is under 15 minutes.
                  </p>
                </div>
              </div>
              <span className="text-amber-400 text-xs font-mono font-bold uppercase border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 rounded-xl">
                Pending SLA
              </span>
            </div>

            {/* Checklist display */}
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-3">Verification Checklist</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.checked ? "text-emerald-400" : "text-white/10"}`} />
                    <span className={item.checked ? "text-white/70" : "text-white/30"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : kycStatus === "action_required" ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg">Additional Information Required</h3>
                <p className="text-white/40 text-xs mt-0.5 max-w-lg">
                  Some document uploads could not be verified by our team. Please adjust details in the onboarding wizard to prevent verification failure.
                </p>
              </div>
            </div>
            <Link href="/dashboard/documents">
              <Button variant="danger" size="sm">Resume KYC Wizard</Button>
            </Link>
          </div>
        ) : (
          /* NOT STARTED YET */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-lg">Onboarding Incomplete ({completionPercent}%)</h3>
                  <p className="text-white/40 text-xs mt-0.5">
                    Complete your verification wizard to unlock bookings and secure standard loyalty credentials.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/documents">
                <Button variant="fleet" size="sm" className="rounded-xl">Start Verification</Button>
              </Link>
            </div>

            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-3">Onboarding Checklist</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.checked ? "text-emerald-400" : "text-white/10"}`} />
                    <span className={item.checked ? "text-white/70" : "text-white/30"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── Active Booking or Empty State ─── */}
      {activeBooking ? (
        <div className="rounded-[30px] bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h3 className="text-white font-bold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Upcoming Experience</h3>
            <span className="text-blue-400 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 uppercase tracking-wider">
              {activeBooking.booking_status.replace(/_/g, " ")}
            </span>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-4 w-full">
              <div>
                <span className="text-[10px] font-mono text-white/30 uppercase">Booking ID: #{activeBooking.booking_reference}</span>
                <h2 className="text-white text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: "var(--font-urbanist)" }}>
                  {activeBooking.vehicle?.brand} {activeBooking.vehicle?.model}
                </h2>
                <p className="text-white/40 text-xs mt-1">{activeBooking.vehicle?.variant || "Automatic Luxury"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 px-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Pick Up</span>
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> {activeBooking.pickup_location}
                  </div>
                  <span className="text-[10px] text-white/40 mt-1 block">
                    {new Date(activeBooking.pickup_datetime).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/30 block mb-1">Return</span>
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> {activeBooking.return_location}
                  </div>
                  <span className="text-[10px] text-white/40 mt-1 block">
                    {new Date(activeBooking.return_datetime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-60 h-40 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] to-transparent z-10 opacity-65" />
              <Car className="w-16 h-16 text-white/10 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute bottom-4 left-4 z-20 text-[10px] uppercase font-bold text-[#E8DCC8]/50">3M Luxury Fleet</span>
            </div>
          </div>
        </div>
      ) : (
        /* Prompt booking */
        <div className="rounded-[30px] p-8 bg-white/[0.02] border border-white/5 text-center flex flex-col justify-center items-center gap-5 min-h-[220px]">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white/20" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-urbanist)" }}>Start Your Premium Adventure</h3>
            <p className="text-white/40 text-xs max-w-sm mt-1 leading-relaxed">
              Rent high-performance models and luxury SUVs with priority delivery at Goa airport terminals.
            </p>
          </div>
          <Link href="/fleet">
            <Button variant="fleet" className="rounded-xl px-6">Explore Curated Fleet</Button>
          </Link>
        </div>
      )}

      {/* ─── Dynamic AI Vehicle Recommendations ─── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold tracking-tight text-xl flex items-center gap-2" style={{ fontFamily: "var(--font-urbanist)" }}>
              <Sparkles className="w-5 h-5 text-blue-400" /> Recommended For You
            </h3>
            <p className="text-white/40 text-xs mt-0.5">AI-powered suggestions matching your favorite vehicle categories.</p>
          </div>
          <Link href="/fleet" className="text-xs text-blue-400 flex items-center gap-1 hover:underline font-bold">
            All Cars <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedVehicles.map(v => (
            <div 
              key={v.id} 
              className="rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 overflow-hidden backdrop-blur-md flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] transition-all duration-300"
            >
              <div className="p-5 space-y-4">
                {/* Visual Image placeholder */}
                <div className="h-32 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-white/10 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                  <Car className="w-12 h-12" />
                  <span className="absolute top-3 left-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                    {v.category?.name || "Premium"}
                  </span>
                </div>

                <div>
                  <h4 className="text-white text-base font-bold">{v.brand} {v.model}</h4>
                  <p className="text-white/40 text-[10px] uppercase mt-0.5">
                    {v.year} · {v.fuel_type} · {v.transmission}
                  </p>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-white/30 block uppercase font-semibold">Base Price</span>
                  <span className="text-white font-extrabold text-sm">INR {Math.round(v.daily_rate).toLocaleString("en-IN")}/day</span>
                </div>
                <Link href={`/fleet?vehicle=${v.id}`}>
                  <Button variant="fleet" size="sm" className="rounded-lg text-[10px] px-3.5 py-1.5 uppercase font-bold">Book Ride</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Verification & Bookings Timeline ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Timeline Log */}
        <div className="lg:col-span-2 rounded-[30px] p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-4">
          <h3 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-urbanist)" }}>Onboarding Timeline Logs</h3>
          
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
            {/* Onboarding start */}
            <div className="relative">
              <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#07080b]" />
              <div className="text-xs font-semibold text-white/80">Account Created</div>
              <p className="text-white/30 text-[10px] leading-relaxed mt-0.5">Authentication registry entry logged successfully.</p>
            </div>

            {/* Profile setup */}
            <div className="relative">
              <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#07080b] ${
                firstName ? "bg-emerald-500" : "bg-white/10"
              }`} />
              <div className="text-xs font-semibold text-white/80">Contact Credentials Configured</div>
              <p className="text-white/30 text-[10px] leading-relaxed mt-0.5">Name and phone verification metrics completed.</p>
            </div>

            {/* KYC Submission */}
            <div className="relative">
              <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#07080b] ${
                kycStatus === "under_review" || kycStatus === "approved" ? "bg-emerald-500" : "bg-white/10"
              }`} />
              <div className="text-xs font-semibold text-white/80">KYC Documents Submitted</div>
              <p className="text-white/30 text-[10px] leading-relaxed mt-0.5">License copies, government ID scans, and selfies loaded.</p>
            </div>

            {/* Approval */}
            <div className="relative">
              <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#07080b] ${
                kycStatus === "approved" ? "bg-emerald-500 animate-pulse" : "bg-white/10"
              }`} />
              <div className="text-xs font-semibold text-white/80">Verification Approval Check</div>
              <p className="text-white/30 text-[10px] leading-relaxed mt-0.5">
                {kycStatus === "approved" 
                  ? "Identity verification approved. Standard checkout enabled." 
                  : "Pending approval review from compliance concierge."}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Contacts concierges */}
        <div className="rounded-[30px] p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg mb-3" style={{ fontFamily: "var(--font-urbanist)" }}>Emergency Assistance</h3>
            <p className="text-white/40 text-xs leading-relaxed">
              Have engine concerns, tire deflation, or need roadside assistance? Dispatch emergency mechanics immediately.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/support#sos" className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl py-3 shadow-lg shadow-red-500/10 transition-colors">
              <AlertOctagon className="w-4 h-4" /> Trigger Roadside SOS
            </Link>
            <Link href="/dashboard/support" className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-3 text-white font-bold text-xs uppercase transition-colors">
              <PhoneCall className="w-4 h-4 text-blue-400" /> Concierge Hotline
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
