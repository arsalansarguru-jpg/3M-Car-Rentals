"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupDate: "",
    returnDate: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        pickupDate: "",
        returnDate: "",
        message: "",
      });
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#060b18]">
        {/* Faint grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold tracking-[0.15em] uppercase mb-6">
            📞 24/7 Concierge
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
            We&apos;re Here to{" "}
            <span className="bg-gradient-to-r from-[#c9a84c] via-[#e8c96d] to-[#c9a84c] bg-clip-text text-transparent">
              Help
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Have questions about booking durations, airport delivery logistics, or specific vehicle features? Reach out and we will respond instantly.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONTACT DETAILS & FORM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info cards (Left block) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-white font-black text-xl mb-6">Direct Connections</h3>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-lg">
                    📞
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Phone / WhatsApp</p>
                    <a href="tel:+919876543210" className="text-white font-semibold hover:text-[#c9a84c] transition-colors duration-200">
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-lg">
                    ✉️
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Email Concierge</p>
                    <a href="mailto:hello@3mcarrentals.com" className="text-white font-semibold hover:text-[#c9a84c] transition-colors duration-200">
                      hello@3mcarrentals.com
                    </a>
                  </div>
                </div>

                {/* Office */}
                <div className="flex gap-4">
                  <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-lg">
                    📍
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Headquarters</p>
                    <p className="text-white text-sm font-medium leading-relaxed">
                      Shop No. 7, Hotel Tree House, Neptune Inn, Opposite New Panjim Market, Near Municipal Market, Panjim, Goa - 403001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency WhatsApp Widget */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#c9a84c]/10 to-transparent border border-[#c9a84c]/20 relative overflow-hidden">
              <span className="absolute top-4 right-4 text-3xl opacity-20">💬</span>
              <h4 className="text-white font-bold text-lg mb-2">Need Immediate Handover Help?</h4>
              <p className="text-white/50 text-xs leading-relaxed mb-6">
                If your flight is landing right now and you need immediate self-drive delivery, call us or ping our WhatsApp emergency response desk.
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25d366] text-[#0a0f1e] font-black text-sm hover:shadow-lg hover:shadow-[#25d366]/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                Launch Live Chat
              </a>
            </div>
          </div>

          {/* Inquiry form (Right block) */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-white font-black text-xl mb-2">Send an Inquiry</h3>
              <p className="text-white/40 text-xs mb-8">
                Fill in the details below and our reservations desk will email you a curated quote.
              </p>

              {submitted ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-2xl">
                    ✅
                  </div>
                  <h4 className="text-white font-bold text-xl mb-3">Inquiry Sent Successfully</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto mb-8">
                    Thank you for reaching out to 3M Car Rentals. A coordinator has received your travel dates and will send a custom booking proposal shortly.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="secondary" size="md">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Priya Menon"
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. priya@domain.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Pick-up Date"
                        type="date"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        label="Return Date"
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2.5">
                      Message / Trip Requirements
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="e.g. Arriving at Mopa Airport at 3 PM, would like to pick up a luxury SUV..."
                      rows={5}
                      required
                      className="w-full bg-[#070b13] border border-white/[0.08] hover:border-white/15 focus:border-[#c9a84c] rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="lg" disabled={loading}>
                      {loading ? "Submitting Inquiry..." : "Submit Inquiry"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
