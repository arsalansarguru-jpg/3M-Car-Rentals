"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CustomerDirectoryItem } from "@/lib/customer-360-engine";

export default function CustomerDirectoryPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customer-360");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card glass-card-shimmer glass-glow-pink p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#ec4899", marginBottom: "0.375rem" }}>Customer 360°</p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em", lineHeight: 1.1 }}>Customer Directory</h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.45)", marginTop: "0.375rem" }}>Unified profiles, Lifetime Value, and KYC tracking.</p>
        </div>
        
        <div className="relative w-full md:w-80 shrink-0">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-3 text-white focus:outline-none transition-all placeholder:text-white/30"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 400 }}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card glass-card-shimmer py-20 text-center" style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "rgba(255,255,255,0.4)" }}>Loading customer database…</div>
      ) : (
        <div className="glass-card glass-card-shimmer overflow-hidden">
          {/* Results count */}
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>
              {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}{search && ' found'}
            </span>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["Customer","Contact","VIP Status","Bookings","Lifetime Value"].map((h,i) => (
                  <th key={h} className={`py-3.5 px-5 ${i >= 3 ? 'text-right' : ''}`}
                    style={{ fontFamily: "var(--font-body)", fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(cust => (
                <tr 
                  key={cust.id}
                  onClick={() => router.push(`/dashboard/admin/customers/${cust.id}`)}
                  className="glass-table-row cursor-pointer group"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0"
                        style={{ fontFamily: "var(--font-heading)", fontSize: "0.75rem", fontWeight: 700, color: "#f9a8d4" }}>
                        {cust.first_name[0]}{cust.last_name[0]}
                      </div>
                      <div>
                        <div className="group-hover:text-[#3B82F6] transition-colors" style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff" }}>
                          {cust.first_name} {cust.last_name}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: "0.1rem" }}>Joined {new Date(cust.joined_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", fontWeight: 400, color: "rgba(255,255,255,0.55)" }}>
                      <span className="flex items-center gap-2"><svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {cust.email}</span>
                      <span className="flex items-center gap-2"><svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {cust.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${
                      cust.vip_status === "Platinum" ? "bg-purple-500/10 border-purple-500/20 text-purple-300" :
                      cust.vip_status === "Gold" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300" :
                      cust.vip_status === "Silver" ? "bg-slate-400/10 border-slate-400/20 text-slate-300" :
                      cust.vip_status === "At Risk" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      "bg-white/5 border-white/10 text-white/50"
                    }`}>
                      {cust.vip_status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 600, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                    {cust.total_bookings}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="font-mono text-[#3B82F6]" style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      ₹{cust.lifetime_value.toLocaleString("en-IN")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-14 text-center" style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "rgba(255,255,255,0.35)" }}>No customers match your search.</div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
