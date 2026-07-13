"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Customer360Profile } from "@/lib/customer-360-engine";

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<Customer360Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "documents" | "support">("overview");

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      try {
        const res = await fetch(`/api/customer-360/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  if (loading) return <div className="py-20 text-center text-white/50">Loading 360° Profile...</div>;
  if (!profile) return <div className="py-20 text-center text-red-400">Customer not found.</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Breadcrumb & Header ── */}
      <div>
        <Link href="/dashboard/admin/customers" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Directory
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-gradient-to-br from-white/[0.05] to-transparent p-8 rounded-2xl border border-white/10 relative overflow-hidden">
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-[#0f1115] text-3xl font-black shadow-lg">
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white">{profile.first_name} {profile.last_name}</h1>
                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                  profile.vip_status === "Platinum" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" :
                  profile.vip_status === "Gold" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" :
                  profile.vip_status === "Silver" ? "bg-gray-400/20 border-gray-400/50 text-gray-200" :
                  profile.vip_status === "At Risk" ? "bg-red-500/20 border-red-500/50 text-red-300" :
                  "bg-white/10 border-white/20 text-white/70"
                }`}>
                  {profile.vip_status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 hover:text-[#3B82F6] transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {profile.phone}</a>
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-[#3B82F6] transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {profile.email}</a>
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Joined {new Date(profile.joined_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 relative z-10 bg-[#0a0b0d]/50 p-6 rounded-xl border border-white/10 backdrop-blur-md">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Total Bookings</p>
              <p className="text-3xl font-mono text-white font-black">{profile.total_bookings}</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Lifetime Value</p>
              <p className="text-3xl font-mono text-[#3B82F6] font-black">₹{(profile.lifetime_value / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto custom-scrollbar">
        {[
          { id: "overview", label: "Overview & Preferences" },
          { id: "history", label: "Booking History" },
          { id: "documents", label: "KYC & Compliance" },
          { id: "support", label: "Incidents & Support" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id 
                ? "border-[#3B82F6] text-[#3B82F6] bg-white/[0.02]" 
                : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2"><svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> Customer Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1115] rounded-lg p-4 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Favorite Category</p>
                    <p className="text-white font-semibold">{profile.preferences.favorite_category}</p>
                  </div>
                  <div className="bg-[#0f1115] rounded-lg p-4 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Preferred Transmission</p>
                    <p className="text-white font-semibold">{profile.preferences.transmission}</p>
                  </div>
                  <div className="bg-[#0f1115] rounded-lg p-4 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Fuel Preference</p>
                    <p className="text-white font-semibold">{profile.preferences.fuel_preference}</p>
                  </div>
                  <div className="bg-[#0f1115] rounded-lg p-4 border border-white/5">
                    <p className="text-white/40 text-xs mb-1">Typical Duration</p>
                    <p className="text-white font-semibold">{profile.preferences.typical_duration} Days</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2"><svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg> Promotional Offers & Coupons Used</h3>
                {profile.coupons_used.length > 0 ? (
                  <div className="space-y-3">
                    {profile.coupons_used.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#0f1115] rounded-lg p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="bg-emerald-500/10 text-emerald-400 font-mono text-xs px-2 py-1 rounded border border-emerald-500/20">{c.code}</span>
                          <span className="text-white/60 text-sm">Used on {new Date(c.date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-white font-bold">-₹{c.discount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm italic">No coupons used historically.</p>
                )}
              </div>
            </div>

            <div className="col-span-1 space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">Refunds & Adjustments</h3>
                {profile.refunds.length > 0 ? (
                  <div className="space-y-3">
                    {profile.refunds.map((r, i) => (
                      <div key={i} className="flex flex-col gap-2 bg-[#0f1115] rounded-lg p-4 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">₹{r.amount}</span>
                          <span className="text-[10px] text-emerald-400 uppercase border border-emerald-400/30 px-2 py-0.5 rounded">{r.status}</span>
                        </div>
                        <span className="text-white/50 text-xs">{r.reason}</span>
                        <span className="text-white/30 text-[10px]">{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm italic">No refunds processed.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Dates</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {profile.bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-6 font-mono text-white/70">{b.booking_reference}</td>
                    <td className="py-4 px-6">
                      {b.vehicle ? (
                        <>
                          <p className="font-bold text-white">{b.vehicle.brand} {b.vehicle.model}</p>
                          <p className="text-xs text-white/40">{b.vehicle.year} • {b.vehicle.category?.name}</p>
                        </>
                      ) : <span className="text-white/40 italic">Vehicle assigned</span>}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white/80">{new Date(b.pickup_datetime).toLocaleDateString()}</p>
                      <p className="text-white/40 text-xs">to {new Date(b.return_datetime).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#3B82F6]">₹{b.total_amount}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.booking_status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        b.booking_status === "cancelled" ? "bg-red-500/10 text-red-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>{b.booking_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {profile.bookings.length === 0 && <div className="p-8 text-center text-white/50">No bookings on record.</div>}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg> Driver License</h3>
               <div className="space-y-4">
                 <div>
                   <p className="text-white/40 text-xs mb-1">License Number</p>
                   <p className="text-lg font-mono font-bold text-white">{profile.documents.license_number || "Not Provided"}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-white/40 text-xs mb-1">Verification Status</p>
                     {profile.documents.verified_status ? (
                       <span className={`px-2 py-1 inline-block rounded text-xs font-bold uppercase ${
                         profile.documents.verified_status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                         profile.documents.verified_status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                         "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                       }`}>{profile.documents.verified_status}</span>
                     ) : <span className="text-white/40 text-sm">N/A</span>}
                   </div>
                   <div>
                     <p className="text-white/40 text-xs mb-1">Expiry Date</p>
                     <p className="text-white text-sm">{profile.documents.expiry_date ? new Date(profile.documents.expiry_date).toLocaleDateString() : "N/A"}</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === "support" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
               <h3 className="text-sm font-bold text-red-400/80 uppercase tracking-widest mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Traffic Violations & Accidents</h3>
               {profile.incidents.traffic_violations.length === 0 && profile.incidents.accidents.length === 0 && (
                 <p className="text-emerald-400/70 text-sm flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Clean record. No incidents reported.</p>
               )}
               <div className="space-y-4">
                 {profile.incidents.traffic_violations.map((v, i) => (
                    <div key={`v-${i}`} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-red-400 font-bold text-sm">Traffic Violation: {v.type}</span>
                        <span className="text-xs text-white/50">{new Date(v.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">{v.location}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-white">Fine: ₹{v.amount}</span>
                        <span className="text-red-300 uppercase border border-red-400/30 px-2 py-0.5 rounded">{v.status}</span>
                      </div>
                    </div>
                 ))}
                 {profile.incidents.accidents.map((a, i) => (
                    <div key={`a-${i}`} className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-orange-400 font-bold text-sm">Accident: {a.type}</span>
                        <span className="text-xs text-white/50">{new Date(a.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white/70 text-sm mb-2">{a.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-white">Damage: ₹{a.damage_cost}</span>
                        <span className="text-orange-300 uppercase border border-orange-400/30 px-2 py-0.5 rounded">{a.status}</span>
                      </div>
                    </div>
                 ))}
               </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-6 flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Support Tickets</h3>
              {profile.support_tickets.length === 0 ? (
                 <p className="text-white/40 text-sm">No support tickets.</p>
              ) : (
                <div className="space-y-3">
                  {profile.support_tickets.map((t, i) => (
                    <div key={i} className="flex flex-col gap-2 bg-[#0f1115] rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-sm">{t.subject}</span>
                        <span className={`text-[10px] uppercase border px-2 py-0.5 rounded ${t.status === "Closed" ? "text-gray-400 border-gray-500/30" : "text-emerald-400 border-emerald-400/30"}`}>{t.status}</span>
                      </div>
                      <div className="flex justify-between text-white/40 text-xs">
                        <span className="font-mono">{t.id}</span>
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
