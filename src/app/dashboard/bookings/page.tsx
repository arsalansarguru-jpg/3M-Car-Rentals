"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { 
  Car, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  FileText, 
  CreditCard, 
  XCircle,
  HelpCircle,
  Clock
} from "lucide-react";

interface Vehicle {
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  fuel_type: string;
  transmission: string;
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

export default function BookingsHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  const fetchBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userProfile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (!userProfile) return;

      const { data } = await supabase
        .from("bookings")
        .select(`*, vehicle:vehicles(brand, model, variant, year, fuel_type, transmission)`)
        .eq("user_id", userProfile.id)
        .order("pickup_datetime", { ascending: false });

      if (data) {
        setBookings(data as any);
      }
    } catch (err) {
      console.error("Fetch Bookings Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ booking_status: "cancelled" })
        .eq("id", id);
      
      if (error) alert(error.message);
      else fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === "active") {
      return ["pending", "confirmed", "ready_for_pickup", "active"].includes(b.booking_status);
    }
    if (activeTab === "completed") {
      return ["completed", "cancelled", "refunded"].includes(b.booking_status);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase">Syncing Reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          Your Bookings History
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Review, configure, or get assistance for your fleet reservations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-6 text-sm">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-4 px-1 font-semibold transition-all relative ${activeTab === "all" ? "text-blue-400" : "text-white/40 hover:text-white"}`}
        >
          All Reservations ({bookings.length})
          {activeTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-1 font-semibold transition-all relative ${activeTab === "active" ? "text-blue-400" : "text-white/40 hover:text-white"}`}
        >
          Active / Upcoming ({bookings.filter(b => ["pending", "confirmed", "ready_for_pickup", "active"].includes(b.booking_status)).length})
          {activeTab === "active" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-4 px-1 font-semibold transition-all relative ${activeTab === "completed" ? "text-blue-400" : "text-white/40 hover:text-white"}`}
        >
          Completed / Past ({bookings.filter(b => ["completed", "cancelled", "refunded"].includes(b.booking_status)).length})
          {activeTab === "completed" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map((b) => {
            const isCancelable = ["pending", "confirmed"].includes(b.booking_status);
            const isUnpaid = b.payment_status === "unpaid";
            
            return (
              <div 
                key={b.id} 
                className="rounded-[24px] bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-md hover:border-blue-500/20 transition-all duration-300"
              >
                {/* Upper bar */}
                <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-white/30">ID: #{b.booking_reference}</span>
                    <span className="text-white/30 text-xs">|</span>
                    <span className="text-[10px] text-white/40 font-semibold uppercase">
                      Created: {new Date(b.pickup_datetime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                      b.booking_status === "confirmed" 
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : b.booking_status === "completed"
                        ? "bg-white/5 border-white/10 text-white/50"
                        : b.booking_status === "cancelled"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {b.booking_status.replace(/_/g, " ")}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                      b.payment_status === "paid"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {b.payment_status}
                    </span>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                        {b.vehicle?.brand} {b.vehicle?.model}
                      </h3>
                      <p className="text-white/40 text-xs mt-0.5">
                        {b.vehicle?.year} · {b.vehicle?.fuel_type} · {b.vehicle?.transmission}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-white/[0.01] border border-white/5">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Pick Up Location</span>
                        <p className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" /> {b.pickup_location}
                        </p>
                        <span className="text-[10px] text-white/40 block font-mono">
                          {new Date(b.pickup_datetime).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Return Location</span>
                        <p className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" /> {b.return_location}
                        </p>
                        <span className="text-[10px] text-white/40 block font-mono">
                          {new Date(b.return_datetime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financials & Action Panel */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col justify-between items-start sm:items-center lg:items-end gap-6 shrink-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold">Amount Due</span>
                      <p className="text-white text-2xl font-black" style={{ fontFamily: "var(--font-urbanist)" }}>
                        INR {Number(b.total_amount).toLocaleString("en-IN")}
                      </p>
                      <span className="text-white/30 text-[10px] block mt-0.5">
                        + INR {Number(b.deposit_amount).toLocaleString("en-IN")} Refundable Deposit
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <FileText className="w-4 h-4 mr-2" /> Receipt
                      </Button>
                      {isUnpaid && (
                        <Button variant="fleet" size="sm" className="rounded-xl">
                          <CreditCard className="w-4 h-4 mr-2" /> Pay Balance
                        </Button>
                      )}
                      {isCancelable && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="rounded-xl"
                          disabled={cancelling === b.id}
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> {cancelling === b.id ? "Processing..." : "Cancel Booking"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border border-white/5 rounded-3xl bg-white/[0.01] py-20 flex flex-col items-center gap-4">
          <Clock className="w-12 h-12 text-white/20" />
          <div>
            <h3 className="text-white font-bold text-lg">No Matching Records Found</h3>
            <p className="text-white/40 text-xs max-w-xs mt-1 mx-auto">
              You do not have any active or past car rental reservations. Ready to pick a vehicle?
            </p>
          </div>
          <Link href="/fleet">
            <Button variant="fleet" size="sm" className="mt-2">Browse Luxury Fleet</Button>
          </Link>
        </div>
      )}

    </div>
  );
}
