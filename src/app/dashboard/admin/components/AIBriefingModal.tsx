"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AIBriefing } from "@/lib/ai-assistant-engine";
import { Button } from "@/components/ui/Button";

export default function AIBriefingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only show once per session
    const hasSeenBriefing = sessionStorage.getItem("hasSeenDailyBriefing");
    if (hasSeenBriefing) {
      setLoading(false);
      return;
    }

    async function fetchBriefing() {
      try {
        const res = await fetch("/api/assistant/briefing");
        if (res.ok) {
          const data = await res.json();
          if (data.briefing) {
            setBriefing(data.briefing);
            setIsOpen(true);
            sessionStorage.setItem("hasSeenDailyBriefing", "true");
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI briefing", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBriefing();
  }, []);

  if (loading || !isOpen || !briefing) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[20px] bg-[#121210]/95 backdrop-blur-[24px] border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-normal text-white mt-0.5" style={{ fontFamily: "var(--font-heading)" }}>AI Executive Briefing</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg font-light text-white/95 mb-6 leading-relaxed">
                  {briefing.greeting}
                </p>

                <div className="space-y-4">
                  <BriefingSection icon="💰" title="Financials & Bookings" content={briefing.revenueAndBookings} />
                  <BriefingSection icon="🚗" title="Fleet Status" content={briefing.fleetStatus} />
                  <BriefingSection icon="👥" title="Staff Performance" content={briefing.staffPerformance} />
                  
                  {briefing.businessRisks.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-red-400 uppercase tracking-wider mb-2">
                        <span>⚠️</span> Business Risks
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-red-200/80 text-sm font-light">
                        {briefing.businessRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                      </ul>
                    </div>
                  )}

                  {briefing.growthOpportunities.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] p-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">
                        <span>🚀</span> Growth Opportunities
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-emerald-200/80 text-sm font-light">
                        {briefing.growthOpportunities.map((opp, i) => <li key={i}>{opp}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Actions Footer */}
            <div className="px-6 py-5 border-t border-white/10 bg-white/[0.02]">
              <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {briefing.actionItems.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    </div>
                    <p className="text-sm text-white/80 font-light">{action}</p>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ai"
                className="mt-6 w-full py-3.5 rounded-[20px]"
              >
                Acknowledge & Start Day
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function BriefingSection({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-[20px] bg-white/[0.04] border border-white/5 flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-white/90 text-[15px] leading-relaxed font-light">{content}</p>
      </div>
    </div>
  );
}
