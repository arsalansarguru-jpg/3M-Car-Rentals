"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Award, Gift, Sparkles, UserPlus, Copy, Compass, Percent, Star } from "lucide-react";

export default function LoyaltyRewardsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "3M-VIP-ARSALAN";

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loyaltyPoints = 1250;
  const nextTierPoints = 2500;
  const progressPercent = Math.round((loyaltyPoints / nextTierPoints) * 100);

  const coupons = [
    { code: "GOAVIP20", discount: "20% OFF", desc: "Applicable on premium SUVs like Defender & Thar", expiry: "Valid till 31st Dec 2026" },
    { code: "FREEAIRPORT", discount: "FREE DELIVERY", desc: "No airport drop-off charges at Mopa (GOX)", expiry: "Valid on bookings above 3 days" }
  ];

  const clubPerks = [
    { title: "Complimentary Airport Pickups", desc: "Never pay delivery surcharges at GOX or GOI terminal zones.", icon: Compass },
    { title: "Priority Booking Windows", desc: "Access high-demand fleet models 24 hours before standard members.", icon: Sparkles },
    { title: "Zero-Security Deposit", desc: "Book any vehicle under INR 15,000/day daily rate without security deposit blocks.", icon: Star }
  ];

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          Prestige Loyalty Club
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Accumulate points, unlock elite membership tiers, and claim curated concierge privileges.
        </p>
      </div>

      {/* Gamified Points Card */}
      <div className="rounded-[30px] p-8 bg-gradient-to-br from-blue-950/20 via-[#C9A84C]/5 to-transparent border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[260px] h-[260px] bg-[#C9A84C]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Progress */}
          <div className="space-y-4 flex-1 w-full">
            <div>
              <span className="text-[10px] text-[#C9A84C] font-extrabold tracking-widest uppercase block mb-1">Active Status Tier</span>
              <h2 className="text-white text-4xl font-black flex items-center gap-2" style={{ fontFamily: "var(--font-urbanist)" }}>
                Club Royal Member <Award className="w-8 h-8 text-[#C9A84C]" />
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/50">
                <span>Progress to <span className="text-white font-bold">VIP Concierge</span></span>
                <span>{loyaltyPoints} / {nextTierPoints} Points ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-[#C9A84C] rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            
            <p className="text-white/40 text-[11px]">
              Earn 1 loyalty point for every INR 100 spent on self-drive rentals and premium concierge options.
            </p>
          </div>

          {/* Highlights */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md shrink-0 lg:w-72 w-full text-center">
            <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold block mb-1">Your Rewards Balance</span>
            <p className="text-[#C9A84C] text-5xl font-black" style={{ fontFamily: "var(--font-urbanist)" }}>
              {loyaltyPoints}
            </p>
            <span className="text-white/40 text-[10px] block mt-1">Active points ready to claim</span>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tier Benefits */}
        <div className="space-y-4">
          <h3 className="text-white font-bold tracking-tight text-xl" style={{ fontFamily: "var(--font-urbanist)" }}>Active Club Privileges</h3>
          <div className="space-y-4">
            {clubPerks.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-4 hover:border-blue-500/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <p.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">{p.title}</h4>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupons & Referrals */}
        <div className="space-y-6">
          {/* Active Vouchers */}
          <div className="space-y-4">
            <h3 className="text-white font-bold tracking-tight text-xl" style={{ fontFamily: "var(--font-urbanist)" }}>Curated Vouchers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map(c => (
                <div key={c.code} className="p-5 rounded-2xl bg-[#090a0f] border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:border-blue-500/20 transition-all duration-300">
                  {/* Decorative tag punch */}
                  <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#07080b] border-r border-white/5" />
                  <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#07080b] border-l border-white/5" />
                  
                  <div>
                    <span className="text-[10px] text-blue-400 font-extrabold flex items-center gap-1 uppercase tracking-wider"><Percent className="w-3.5 h-3.5" /> {c.discount}</span>
                    <h4 className="text-white text-xs mt-2 font-bold">{c.desc}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] font-mono text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded">{c.code}</span>
                    <span className="text-[9px] text-white/30">{c.expiry}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Program */}
          <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0 mt-0.5">
                <UserPlus className="w-5 h-5 text-[#C9A84C]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Invite a Traveller</h4>
                <p className="text-white/40 text-xs mt-1 leading-relaxed">
                  Gift your colleagues INR 2,000 off their first premium booking and earn 500 loyalty points for every successful rental checkout.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/70 font-mono flex-1 flex items-center">
                {referralCode}
              </div>
              <button 
                onClick={handleCopyReferral}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
