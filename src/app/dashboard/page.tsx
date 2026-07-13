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
  Heart,
  ChevronRight,
  Sparkles
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
  const [userName, setUserName] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favoriteVehicles, setFavoriteVehicles] = useState<Vehicle[]>([]);
  const [licenseStatus, setLicenseStatus] = useState("Pending Verification");
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [membershipTier, setMembershipTier] = useState("Club Royal");
  const [walletBalance, setWalletBalance] = useState(5000); // Mock credits

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
          .select("id, first_name, last_name")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (profile) {
          setUserName(profile.first_name || "Guest");
          
          // Fetch Bookings
          const { data: bookingsData } = await supabase
            .from("bookings")
            .select(`*, vehicle:vehicles(id, brand, model, variant, year, daily_rate)`)
            .eq("user_id", profile.id)
            .order("pickup_datetime", { ascending: false });
          
          if (bookingsData) {
            setBookings(bookingsData as any);
          }

          // Fetch License Status
          const { data: license } = await supabase
            .from("driver_licenses")
            .select("verified_status")
            .eq("user_id", profile.id)
            .maybeSingle();
          
          if (license) {
            if (license.verified_status === "approved") setLicenseStatus("Verified");
            else if (license.verified_status === "rejected") setLicenseStatus("Action Required");
            else setLicenseStatus("Pending Verification");
          }
        }

        // Fetch some mock/real vehicles for favorites
        const { data: vehicles } = await supabase
          .from("vehicles")
          .select("id, brand, model, variant, year, daily_rate")
          .limit(3);
        
        if (vehicles) {
          setFavoriteVehicles(vehicles as any);
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
        <p className="text-white/40 text-xs uppercase tracking-widest font-mono">Loading Luxury Experience...</p>
      </div>
    );
  }

  // Active / Upcoming Rental
  const activeBooking = bookings.find(b => ["confirmed", "active", "ready_for_pickup"].includes(b.booking_status));
  // Previous Rentals
  const previousBookings = bookings.filter(b => ["completed", "cancelled"].includes(b.booking_status));

  return (
    <div className="space-y-8 font-sans">
      
      {/* ─── Hero Welcome Section ─── */}
      <div className="relative rounded-[30px] p-8 overflow-hidden bg-gradient-to-br from-blue-900/20 via-indigo-950/10 to-transparent border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Prestige Club Access
            </span>
            <h1 className="text-white text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
              Welcome Back, {userName}
            </h1>
            <p className="text-white/50 text-sm mt-1" style={{ fontFamily: "var(--font-manrope)" }}>
              Goa&apos;s finest roads await you. Your concierge is ready.
            </p>
          </div>
          <Link href="/fleet">
            <Button variant="fleet" className="rounded-2xl px-6 py-4 font-bold shadow-lg shadow-blue-500/10 flex items-center gap-2">
              Book Your Next Ride <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Metrics Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Wallet Balance */}
        <div className="rounded-[24px] p-5 bg-white/[0.02] border border-white/5 backdrop-blur-xl flex items-center gap-4 hover:border-blue-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">Wallet Credit</span>
            <p className="text-white text-lg font-extrabold" style={{ fontFamily: "var(--font-urbanist)" }}>
              INR {walletBalance.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="rounded-[24px] p-5 bg-white/[0.02] border border-white/5 backdrop-blur-xl flex items-center gap-4 hover:border-blue-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">Loyalty Rewards</span>
            <p className="text-white text-lg font-extrabold" style={{ fontFamily: "var(--font-urbanist)" }}>
              {loyaltyPoints} Pts · <span className="text-blue-400 font-bold">{membershipTier}</span>
            </p>
          </div>
        </div>

        {/* KYC Verification Status */}
        <div className="rounded-[24px] p-5 bg-white/[0.02] border border-white/5 backdrop-blur-xl flex items-center gap-4 hover:border-blue-500/20 transition-all duration-300">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            licenseStatus === "Verified" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">KYC Credentials</span>
            <p className="text-white text-sm font-bold" style={{ fontFamily: "var(--font-manrope)" }}>
              {licenseStatus}
            </p>
          </div>
        </div>

        {/* Security Deposits */}
        <div className="rounded-[24px] p-5 bg-white/[0.02] border border-white/5 backdrop-blur-xl flex items-center gap-4 hover:border-blue-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">Deposits Held</span>
            <p className="text-white text-lg font-extrabold" style={{ fontFamily: "var(--font-urbanist)" }}>
              INR 0.00
            </p>
          </div>
        </div>
      </div>

      {/* ─── Hero: Active / Upcoming Booking ─── */}
      {activeBooking ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-[30px] bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <h3 className="text-white font-bold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Upcoming Experience</h3>
              <span className="text-blue-400 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 uppercase tracking-wider">
                {activeBooking.booking_status.replace(/_/g, " ")}
              </span>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
              {/* Vehicle Specs */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <span className="text-[10px] font-mono text-white/30 uppercase">Booking ID: #{activeBooking.booking_reference}</span>
                  <h2 className="text-white text-3xl font-extrabold tracking-tight mt-1" style={{ fontFamily: "var(--font-urbanist)" }}>
                    {activeBooking.vehicle?.brand} {activeBooking.vehicle?.model}
                  </h2>
                  <p className="text-white/40 text-xs mt-1">{activeBooking.vehicle?.variant || "Automatic Luxury"}</p>
                </div>

                {/* Timeline */}
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

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href={`/dashboard/bookings`}>
                    <Button variant="fleet" size="sm">Manage Booking</Button>
                  </Link>
                  <Button variant="outline" size="sm">Download Pre-Rent Invoice</Button>
                </div>
              </div>

              {/* Mock Vehicle Image */}
              <div className="w-full md:w-60 h-40 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] to-transparent z-10 opacity-65" />
                <Car className="w-16 h-16 text-white/10 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute bottom-4 left-4 z-20 text-[10px] uppercase font-bold text-[#E8DCC8]/50">3M Luxury Fleet</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-[30px] p-6 bg-white/[0.02] border border-white/5 flex flex-col justify-between backdrop-blur-md">
            <div>
              <h3 className="text-white font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/documents" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Upload KYC</span>
                </Link>
                <Link href="/dashboard/support" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <PhoneCall className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Concierge</span>
                </Link>
                <Link href="/dashboard/rewards" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <Award className="w-6 h-6 text-[#C9A84C] mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Claim Gift</span>
                </Link>
                <Link href="/dashboard/payments" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <Wallet className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Add Cash</span>
                </Link>
              </div>
            </div>

            {/* Emergency Roadside Assistance Widget */}
            <div className="mt-6 p-4 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-between">
              <div>
                <h4 className="text-white text-xs font-extrabold flex items-center gap-1.5"><AlertOctagon className="w-4 h-4 text-red-400" /> SOS Help Line</h4>
                <p className="text-white/40 text-[10px] mt-0.5">Need immediate assistance on road?</p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/support#sos")}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl shadow-lg transition-colors"
              >
                Call SOS
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State with Featured Vehicles */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-[30px] p-8 bg-white/[0.02] border border-white/5 flex flex-col justify-center items-center text-center gap-6 min-h-[300px] backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white/20" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-1" style={{ fontFamily: "var(--font-urbanist)" }}>No Active Reservations</h3>
              <p className="text-white/40 text-sm max-w-sm" style={{ fontFamily: "var(--font-manrope)" }}>
                Start your next premium adventure by selecting a curated vehicle from our collection.
              </p>
            </div>
            <Link href="/fleet">
              <Button variant="fleet" className="rounded-xl px-6">🏎️ Explore Premium Fleet</Button>
            </Link>
          </div>

          <div className="rounded-[30px] p-6 bg-white/[0.02] border border-white/5 flex flex-col justify-between backdrop-blur-md">
            <div>
              <h3 className="text-white font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/documents" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Upload KYC</span>
                </Link>
                <Link href="/dashboard/support" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <PhoneCall className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Concierge</span>
                </Link>
                <Link href="/dashboard/rewards" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <Award className="w-6 h-6 text-[#C9A84C] mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Claim Gift</span>
                </Link>
                <Link href="/dashboard/payments" className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/5 hover:border-blue-500/20 text-center transition-all">
                  <Wallet className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-white/80">Add Cash</span>
                </Link>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-red-950/20 border border-red-500/20 flex items-center justify-between">
              <div>
                <h4 className="text-white text-xs font-extrabold flex items-center gap-1.5"><AlertOctagon className="w-4 h-4 text-red-400" /> SOS Help Line</h4>
                <p className="text-white/40 text-[10px] mt-0.5">Need immediate assistance on road?</p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/support#sos")}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-3 py-2 rounded-xl shadow-lg transition-colors"
              >
                Call SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Middle Section: Favorites & Previous Rentals ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Curated Recommendations (Favorites) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold tracking-tight text-xl" style={{ fontFamily: "var(--font-urbanist)" }}>Your Handpicked Favorites</h3>
            <Link href="/fleet" className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
              View Fleet <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {favoriteVehicles.map(v => (
              <div key={v.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center hover:border-blue-500/20 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-white/30" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">{v.brand} {v.model}</h4>
                    <span className="text-[10px] text-white/40 uppercase">{v.variant || "Petrol · Automatic"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-extrabold">INR {Math.round(v.daily_rate).toLocaleString("en-IN")}/day</p>
                  <Link href={`/fleet?vehicle=${v.id}`}>
                    <span className="text-[10px] text-blue-400 font-bold hover:underline block mt-1">Book Ride</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Experiences Timeline */}
        <div className="space-y-4">
          <h3 className="text-white font-bold tracking-tight text-xl" style={{ fontFamily: "var(--font-urbanist)" }}>Recent Adventures</h3>
          
          {previousBookings.length > 0 ? (
            <div className="space-y-4">
              {previousBookings.slice(0, 3).map(b => (
                <div key={b.id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-mono text-white/30">Ref: #{b.booking_reference}</p>
                    <h4 className="text-white text-sm font-bold mt-0.5">{b.vehicle?.brand} {b.vehicle?.model}</h4>
                    <span className="text-[10px] text-white/40">{new Date(b.pickup_datetime).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] text-white/40 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 uppercase">
                      {b.booking_status}
                    </span>
                    <button className="text-[10px] text-blue-400 hover:underline block mt-1.5 font-semibold">
                      Re-Book Vehicle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] text-center text-white/35 text-xs font-mono py-12">
              No previous bookings recorded in your profile history.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
