"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Download,
  AlertCircle
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  payment_status: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  booking: {
    booking_reference: string;
    vehicle: {
      brand: string;
      model: string;
    } | null;
  } | null;
}

export default function PaymentsWalletPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(5000);
  const [addingFunds, setAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  const fetchPayments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // The RLS policy on payments allows us to fetch only payments belonging to bookings owned by the authenticated user.
      const { data } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          payment_status,
          payment_method,
          paid_at,
          created_at,
          booking:bookings(
            booking_reference,
            vehicle:vehicles(brand, model)
          )
        `)
        .order("created_at", { ascending: false });

      if (data) {
        setPayments(data as any);
      }
    } catch (err) {
      console.error("Fetch Payments Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) return;
    setWalletBalance(prev => prev + amt);
    setFundAmount("");
    setAddingFunds(false);
    alert(`Successfully added INR ${amt.toLocaleString("en-IN")} to your 3M Credits wallet.`);
  };

  const savedCards = [
    { brand: "Visa", number: "•••• •••• •••• 4242", expiry: "12/28", holder: "Arsalan Sarguru" },
    { brand: "Mastercard", number: "•••• •••• •••• 8890", expiry: "06/27", holder: "Arsalan Sarguru" }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase">Retrieving Transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          Payments & Wallet Ledger
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Review transactions, manage saved payment cards, and configure your 3M Credits balance.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card */}
        <div className="rounded-[24px] p-6 bg-gradient-to-br from-emerald-950/20 to-transparent border border-emerald-500/10 backdrop-blur-md flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Available Credits</span>
              <p className="text-white text-3xl font-black" style={{ fontFamily: "var(--font-urbanist)" }}>
                INR {walletBalance.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          
          {addingFunds ? (
            <form onSubmit={handleAddFunds} className="flex gap-2 mt-4">
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Amount"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 w-full focus:outline-none"
                required
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 rounded-lg transition-colors">Add</button>
              <button type="button" onClick={() => setAddingFunds(false)} className="text-white/40 hover:text-white text-xs px-1">Cancel</button>
            </form>
          ) : (
            <button 
              onClick={() => setAddingFunds(true)}
              className="mt-4 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 rounded-xl py-2 px-4 text-emerald-400 font-bold text-xs uppercase transition-all w-fit"
            >
              <Plus className="w-3.5 h-3.5" /> Add Funds
            </button>
          )}
        </div>

        {/* Deposits Held Card */}
        <div className="rounded-[24px] p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Security Deposits held</span>
              <p className="text-white text-3xl font-black" style={{ fontFamily: "var(--font-urbanist)" }}>
                INR 0.00
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <span className="text-white/40 text-[10px] block font-semibold leading-relaxed mt-4">
            Refundable deposits are released automatically within 48 hours of vehicle check-in.
          </span>
        </div>

        {/* Saved Cards Widget */}
        <div className="rounded-[24px] p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-urbanist)" }}>Saved Methods</h3>
            <CreditCard className="w-4 h-4 text-white/30" />
          </div>
          <div className="space-y-2 mt-4">
            {savedCards.map(c => (
              <div key={c.number} className="flex justify-between text-[11px] font-semibold text-white/60">
                <span>{c.brand} ({c.number})</span>
                <span className="text-white/30">{c.expiry}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Ledger Log Section */}
      <div className="space-y-4">
        <h3 className="text-white font-bold tracking-tight text-xl" style={{ fontFamily: "var(--font-urbanist)" }}>Transaction Logs</h3>
        
        {payments.length > 0 ? (
          <div className="rounded-[24px] border border-white/5 overflow-hidden bg-white/[0.01]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.02] text-white/40 uppercase tracking-wider font-bold border-b border-white/5">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Vehicle / Invoice</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-mono text-[10px] text-white/50">
                      PAY-{p.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      {p.booking?.vehicle 
                        ? `${p.booking.vehicle.brand} ${p.booking.vehicle.model}` 
                        : "Premium Rental"}
                      <span className="text-[10px] text-white/30 block mt-0.5">Ref: #{p.booking?.booking_reference || "N/A"}</span>
                    </td>
                    <td className="p-4 font-semibold text-white/70">
                      {p.payment_method || "UPI"}
                    </td>
                    <td className="p-4 font-bold text-white">
                      INR {Number(p.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" className="rounded-xl px-3 py-1">
                        <Download className="w-3.5 h-3.5 mr-1" /> Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 border border-white/5 bg-white/[0.01] text-center text-white/35 rounded-3xl py-16 flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-white/20" />
            <div>
              <h4 className="text-white font-bold">No Transaction Logs</h4>
              <p className="text-white/40 text-xs mt-1">You have not completed any payments yet.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
