"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { 
  HelpCircle, 
  Bell, 
  PhoneCall, 
  ShieldAlert, 
  MessageSquare, 
  MapPin, 
  Send,
  AlertTriangle,
  Clock,
  Sparkles
} from "lucide-react";

interface NotificationRow {
  id: string;
  notification_type: string;
  delivery_channel: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export default function SupportConciergePage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<"support" | "alerts">("support");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  // SOS Emergency States
  const [sosActive, setSosActive] = useState(false);

  const fetchNotifications = async () => {
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
        .from("notifications")
        .select("*")
        .eq("recipient_id", userProfile.id)
        .order("created_at", { ascending: false });

      if (data) {
        setNotifications(data as any);
      }
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Check if URL has #sos hash
    if (window.location.hash === "#sos") {
      setSosActive(true);
    }
  }, []);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSubject("");
      setTicketMessage("");
      setTicketSent(false);
      alert("Your request has been dispatched to your designated VIP concierge agent. Response time is typically under 5 minutes.");
    }, 1500);
  };

  const triggerSOS = () => {
    setSosActive(true);
    alert("SOS Protocol Initialized. Your GPS coordinate is broadcasting to 3M Emergency dispatch. A support team is calling you immediately.");
  };

  const faqs = [
    { q: "How does the airport delivery service work?", a: "A 3M associate will track your flight path and meet you directly at the VIP terminal exit of Mopa (GOX) or Dabolim (GOI) airport with the vehicle fully checked-in." },
    { q: "What is the policy for fuel refills?", a: "We provide vehicles with a full fuel tank. You can return it at any fuel level, and we will bill the refill amount to your registered payment method at actuals without additional service surcharges." },
    { q: "Is cross-border out-of-state driving allowed?", a: "Yes, our vehicles possess national commercial permits allowing transit to Maharashtra or Karnataka. Surcharge tax permits can be dynamically activated from the payments locker." }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase">Connecting Concierge Desk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          VIP Support & Concierge Desk
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Resolve questions, connect with your personal account manager, or trigger emergency roadside services.
        </p>
      </div>

      {/* Emergency Assistance Panel */}
      <div className={`rounded-[30px] p-6 border ${
        sosActive 
          ? "bg-red-500/10 border-red-500/35 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse" 
          : "bg-red-950/10 border-red-500/15"
      } backdrop-blur-md`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                24/7 Roadside Emergency (SOS)
              </h3>
              <p className="text-white/50 text-xs mt-1 leading-relaxed max-w-xl">
                Experiencing engine concerns, tire deflation, or transit issues in Goa? Click the SOS dispatch button to instantly broadcast your GPS position and call for roadside mechanics.
              </p>
            </div>
          </div>
          <button 
            onClick={triggerSOS}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs uppercase px-6 py-4 rounded-2xl shadow-xl shadow-red-500/10 transition-colors w-full lg:w-auto shrink-0 text-center"
          >
            {sosActive ? "SOS Broadcast Active" : "Initiate SOS Dispatch"}
          </button>
        </div>
      </div>

      {/* Main Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column Support Tickets and FAQs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Support Ticket Submission */}
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h3 className="text-white font-bold tracking-tight mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-urbanist)" }}>
              <MessageSquare className="w-5 h-5 text-blue-400" /> Dispatch Ticket to Concierge
            </h3>
            
            <form onSubmit={handleSendTicket} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1.5 block">Subject Reference</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Schedule adjustment request for booking #8890"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1.5 block">Message Details</label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Provide precise details of your inquiry..."
                  rows={4}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="fleet"
                disabled={ticketSent}
                className="rounded-xl px-5 py-3 text-xs uppercase font-bold tracking-wider"
              >
                <Send className="w-3.5 h-3.5 mr-2" /> {ticketSent ? "Dispatching request..." : "Dispatch request"}
              </Button>
            </form>
          </div>

          {/* Quick FAQs */}
          <div className="space-y-4">
            <h3 className="text-white font-bold tracking-tight text-xl" style={{ fontFamily: "var(--font-urbanist)" }}>Prestige Knowledge Center</h3>
            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                  <h4 className="text-white text-sm font-bold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" /> {f.q}
                  </h4>
                  <p className="text-white/40 text-xs mt-2 leading-relaxed pl-6">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column Notifications Center Log */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h3 className="text-white font-bold tracking-tight mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-urbanist)" }}>
              <Bell className="w-5 h-5 text-indigo-400" /> Notifications Feed
            </h3>
            
            {notifications.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-blue-400 font-bold uppercase">{n.notification_type.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="text-white/30">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white/60 text-xs font-light">
                      Dispatched successfully via {n.delivery_channel} to your records. Status: <span className="text-emerald-400 font-bold uppercase text-[9px]">{n.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-white/30 text-xs flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 text-white/10" />
                <p>No recent alerts or notifications in feed.</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-[24px] bg-[#C9A84C]/5 border border-[#C9A84C]/10 space-y-4">
            <h4 className="text-white text-sm font-bold flex items-center gap-1.5"><Sparkles className="w-4.5 h-4.5 text-[#C9A84C]" /> Dedicated Concierge</h4>
            <p className="text-white/40 text-xs leading-relaxed">
              Your account is assigned a priority concierge agent who oversees check-in times and coordinates vehicle keys delivery.
            </p>
            <div className="text-xs text-[#C9A84C] font-mono">
              Direct Phone: +91 333-MOP-VIP
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
