"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  X,
  CreditCard,
  Percent,
  TrendingDown,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileSignature
} from "lucide-react";

interface Payment {
  id: string;
  booking_id: string;
  payment_gateway: string;
  transaction_reference: string | null;
  amount: number;
  payment_status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  booking: {
    booking_reference: string;
    deposit_amount: number;
    payment_status: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  } | null;
}

interface Booking {
  id: string;
  booking_reference: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
}

interface FinanceDashboardClientProps {
  initialPayments: Payment[];
  bookings: Booking[];
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FinanceDashboardClient({ initialPayments, bookings }: FinanceDashboardClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Selection drawer state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Sync state after financial operations
  const fetchUpdatedPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select(`
        *,
        booking:bookings(
          booking_reference,
          deposit_amount,
          payment_status,
          user:users(first_name, last_name, email)
        )
      `)
      .order("created_at", { ascending: false });
    if (data) {
      setPayments(data as any);
    }
  };

  const selectedPayment = payments.find(p => p.id === selectedId);

  // Financial Calculations
  const todayStr = new Date().toDateString();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Revenue Today (captured or authorized payments paid today)
  const revenueToday = payments
    .filter(p => 
      (p.payment_status === "captured" || p.payment_status === "authorized") && 
      p.paid_at && new Date(p.paid_at).toDateString() === todayStr
    )
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Revenue This Month
  const revenueThisMonth = payments
    .filter(p => {
      if ((p.payment_status !== "captured" && p.payment_status !== "authorized") || !p.paid_at) return false;
      const d = new Date(p.paid_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Pending Payments
  const pendingPayments = payments
    .filter(p => p.payment_status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Deposits Held (deposit sum on non-cancelled bookings where payment status is paid/partially_paid)
  const depositsHeld = bookings
    .filter(b => b.booking_status !== "cancelled" && (b.payment_status === "paid" || b.payment_status === "partially_paid"))
    .reduce((sum, b) => sum + Number(b.deposit_amount), 0);

  // Pending Refunds (sum of refunded transaction amounts)
  const pendingRefunds = payments
    .filter(p => p.payment_status === "refunded")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Failed Payments
  const failedPayments = payments
    .filter(p => p.payment_status === "failed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Outstanding Balance (unpaid booking amounts on non-cancelled bookings)
  const outstandingBalance = bookings
    .filter(b => b.booking_status !== "cancelled" && b.payment_status === "unpaid")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  // Net Cash Flow (Captured cash minus refunded cash)
  const netCashFlow = payments
    .filter(p => p.payment_status === "captured")
    .reduce((sum, p) => sum + Number(p.amount), 0) - pendingRefunds;

  // Action: Clear Pending Payment (Capture)
  const handleClearPayment = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const pObj = payments.find(p => p.id === paymentId);
      if (!pObj) return;

      const { error } = await supabase
        .from("payments")
        .update({ 
          payment_status: "captured",
          paid_at: new Date().toISOString()
        })
        .eq("id", paymentId);

      if (error) throw error;
      
      // Update corresponding booking payment status
      await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", pObj.booking_id);

      fetchUpdatedPayments();
      alert("Payment captured successfully.");
    } catch (err) {
      console.error("[Finance] Failed to clear payment:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Process Refund
  const handleProcessRefund = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const pObj = payments.find(p => p.id === paymentId);
      if (!pObj) return;

      const { error } = await supabase
        .from("payments")
        .update({ 
          payment_status: "refunded"
        })
        .eq("id", paymentId);

      if (error) throw error;

      // Update corresponding booking payment status to refunded
      await supabase
        .from("bookings")
        .update({ payment_status: "refunded" })
        .eq("id", pObj.booking_id);

      fetchUpdatedPayments();
      alert("Refund dispatched and completed.");
    } catch (err) {
      console.error("[Finance] Failed to process refund:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Action: Fail Payment
  const handleFailPayment = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const { error } = await supabase
        .from("payments")
        .update({ payment_status: "failed" })
        .eq("id", paymentId);

      if (error) throw error;
      fetchUpdatedPayments();
    } catch (err) {
      console.error("[Finance] Failed to mark payment as failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "captured":
      case "paid":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "pending":
      case "authorized":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "refunded":
        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
      case "failed":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-white/5 border-white/10 text-white/50";
    }
  };

  // Filters logic
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      (p.transaction_reference || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.booking?.booking_reference || "").toLowerCase().includes(search.toLowerCase()) ||
      `${p.booking?.user?.first_name} ${p.booking?.user?.last_name}`.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.payment_status === statusFilter;
    const matchesMethod = methodFilter === "all" || p.payment_method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-widest block mb-1">Prestige Command Center</span>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>Financial Operations</h1>
          <p className="text-white/40 text-xs mt-1">Audit cash reconciliations, handle refunds, and check deposits held.</p>
        </div>
      </div>

      {/* ─── FINANCIAL KPI GRID ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Revenue Today", value: formatINR(revenueToday), icon: TrendingUp, color: "text-[#3B82F6] bg-blue-500/5 border-blue-500/10" },
          { title: "Revenue This Month", value: formatINR(revenueThisMonth), icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
          { title: "Pending Payments", value: formatINR(pendingPayments), icon: Clock, color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
          { title: "Deposits Held", value: formatINR(depositsHeld), icon: ShieldCheck, color: "text-blue-400 bg-blue-500/5 border-blue-500/10" },
          { title: "Refunds Dispatched", value: formatINR(pendingRefunds), icon: TrendingDown, color: "text-purple-400 bg-purple-500/5 border-purple-500/10" },
          { title: "Failed Transactions", value: formatINR(failedPayments), icon: XCircle, color: "text-red-400 bg-red-500/5 border-red-500/10" },
          { title: "Outstanding Balance", value: formatINR(outstandingBalance), icon: AlertTriangle, color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
          { title: "Net Cash Flow", value: formatINR(netCashFlow), icon: Wallet, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" }
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={`border rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl ${card.color}`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider block">{card.title}</span>
              <span className="text-xl md:text-2xl font-black text-white mt-1 block font-mono leading-none">{card.value}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <card.icon className="w-5 h-5 shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── SEARCH & FILTER CONTROLS ─── */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <h3 className="text-white font-extrabold text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Transaction Ledger</h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search reference or booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 w-full md:w-56"
            />
          </div>

          {/* Selector filters */}
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none flex-1 md:flex-initial"
            >
              <option value="all">All Statuses</option>
              <option value="captured">Captured</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none flex-1 md:flex-initial"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CreditCard">Credit Card</option>
              <option value="DebitCard">Debit Card</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── TRANSACTIONS TABLE ─── */}
      <div className="border border-white/15 bg-white/[0.01] rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider bg-white/[0.02]">
                <th className="py-4 px-6">Transaction Ref</th>
                <th className="py-4 px-6">Booking Ref</th>
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Gateway</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-white/80">
              {filteredPayments.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedId(p.id)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-4 px-6 font-mono font-bold text-white/50 uppercase tracking-wider">
                    {p.transaction_reference ? p.transaction_reference.substring(0, 16) : <span className="text-white/20 italic">No Ref</span>}
                  </td>
                  <td className="py-4 px-6 font-mono text-[#3B82F6] font-bold">
                    #{p.booking?.booking_reference || "N/A"}
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    {p.booking?.user ? `${p.booking.user.first_name} ${p.booking.user.last_name}` : "Unknown"}
                  </td>
                  <td className="py-4 px-6 text-white/60">{p.payment_method || "N/A"}</td>
                  <td className="py-4 px-6 text-white/60">{p.payment_gateway}</td>
                  <td className="py-4 px-6 font-mono text-white/60">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold">{formatINR(p.amount)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(p.payment_status)}`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-1.5">
                      {p.payment_status === "pending" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleClearPayment(p.id)}
                          disabled={processingId === p.id}
                          className="text-[9px] uppercase font-bold py-1 h-auto rounded-lg px-2"
                        >
                          Clear
                        </Button>
                      )}
                      {p.payment_status === "captured" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcessRefund(p.id)}
                          disabled={processingId === p.id}
                          className="text-[9px] uppercase font-bold py-1 h-auto rounded-lg px-2 text-purple-400 hover:text-white border-purple-500/20"
                        >
                          Refund
                        </Button>
                      )}
                      {p.payment_status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFailPayment(p.id)}
                          disabled={processingId === p.id}
                          className="text-[9px] uppercase font-bold py-1 h-auto rounded-lg px-2 text-red-400 border-red-500/10"
                        >
                          Fail
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedId(p.id)}
                        className="text-[9px] uppercase font-bold py-1 h-auto rounded-lg px-2"
                      >
                        Logs
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/30 font-mono italic">
                    No transactions found in ledger audits.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Drawer / Sidebar ─── */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex justify-end select-none">
            {/* Dark glass overlay */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
              onClick={() => setSelectedId(null)} 
            />
            
            {/* Luxury Drawer Panel */}
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="w-full max-w-xl bg-[#0c0d10] border-l border-white/10 h-full relative z-10 flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-6">
                
                {/* Header panel */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-[#3B82F6] uppercase tracking-wider">Transaction ID: {selectedPayment.id}</span>
                    <h3 className="text-white text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Ledger Reconciliation</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Amount detail */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-center space-y-2">
                  <span className="text-[9px] uppercase font-bold text-white/30 tracking-wider font-mono">Total Reconciled Amount</span>
                  <h2 className="text-white font-mono text-3xl font-black">{formatINR(selectedPayment.amount)}</h2>
                  <div className="inline-flex">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(selectedPayment.payment_status)}`}>
                      {selectedPayment.payment_status}
                    </span>
                  </div>
                </div>

                {/* Audit values */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3 font-mono text-xs">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block font-sans">Gateway Specifications</span>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/40">Gateway Provider:</span>
                      <span className="text-white">{selectedPayment.payment_gateway}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/40">Payment Method:</span>
                      <span className="text-white">{selectedPayment.payment_method || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/40">Transaction Code:</span>
                      <span className="text-white font-bold">{selectedPayment.transaction_reference || "No Reference Code"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/40">Initial Booking:</span>
                      <span className="text-white text-[#3B82F6]">#{selectedPayment.booking?.booking_reference || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/40">Authorized Date:</span>
                      <span className="text-white">{new Date(selectedPayment.created_at).toLocaleString()}</span>
                    </div>
                    {selectedPayment.paid_at && (
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Cleared Timestamp:</span>
                        <span className="text-[#10B981]">{new Date(selectedPayment.paid_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer specifics */}
                {selectedPayment.booking?.user && (
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Associated Customer</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono">
                        {selectedPayment.booking.user.first_name[0]}{selectedPayment.booking.user.last_name[0]}
                      </div>
                      <div className="text-xs">
                        <h4 className="text-white font-bold">{selectedPayment.booking.user.first_name} {selectedPayment.booking.user.last_name}</h4>
                        <p className="text-white/40 mt-0.5">{selectedPayment.booking.user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operational actions inside drawer */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3 text-xs">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Operational Action Dispatch</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPayment.payment_status === "pending" && (
                      <Button
                        onClick={() => handleClearPayment(selectedPayment.id)}
                        disabled={processingId === selectedPayment.id}
                        className="w-full text-[10px] uppercase font-bold h-10 rounded-xl"
                      >
                        Clear Pending Payment
                      </Button>
                    )}
                    {selectedPayment.payment_status === "captured" && (
                      <Button
                        onClick={() => handleProcessRefund(selectedPayment.id)}
                        disabled={processingId === selectedPayment.id}
                        className="w-full text-[10px] uppercase font-bold h-10 rounded-xl text-purple-400 border-purple-500/20 hover:text-white"
                        variant="outline"
                      >
                        Process Total Refund
                      </Button>
                    )}
                    {selectedPayment.payment_status === "pending" && (
                      <Button
                        onClick={() => handleFailPayment(selectedPayment.id)}
                        disabled={processingId === selectedPayment.id}
                        className="w-full text-[10px] uppercase font-bold h-10 rounded-xl text-red-400 border-red-500/10"
                        variant="outline"
                      >
                        Mark As Failed
                      </Button>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer CTA */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={() => setSelectedId(null)}
                  variant="outline"
                  className="rounded-xl text-[10px] uppercase font-bold px-6 py-2 h-auto"
                >
                  Close Ledger
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
