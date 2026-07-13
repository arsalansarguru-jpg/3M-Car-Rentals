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
    <div className="min-h-screen bg-[#121210]">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#1A1916]">
        {/* Faint grid background */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#C9A84C]/10" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-6 h-px bg-[#C9A84C]/40" />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#C9A84C",
              }}
            >
              24/7 Concierge Desk
            </span>
            <span className="block w-6 h-px bg-[#C9A84C]/40" />
          </div>
          <h1
            className="text-white tracking-wide mb-6 leading-tight max-w-4xl mx-auto"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 300,
            }}
          >
            We&apos;re Here to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8DCC8, #C9A84C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Help
            </span>
          </h1>
          <p
            className="leading-relaxed max-w-2xl mx-auto mb-10 text-[#E8DCC8]/60"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.125rem",
              fontWeight: 300,
            }}
          >
            Have questions about booking durations, airport delivery logistics, or specific vehicle features? Reach out and we will respond instantly.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONTACT DETAILS & FORM
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Info cards (Left block) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-10 bg-white/[0.015] border border-white/[0.06]">
              <h3
                className="text-white mb-8"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.75rem",
                  fontWeight: 400,
                }}
              >
                Direct Connections
              </h3>

              <div className="space-y-8">
                {/* Phone */}
                <div className="flex gap-4">
                  <div
                    className="flex items-center justify-center shrink-0 w-12 h-12 border border-[#C9A84C]/20 text-base"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "#C9A84C",
                    }}
                  >
                    📞
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(212, 197, 176, 0.4)",
                      }}
                    >
                      Phone / WhatsApp
                    </p>
                    <a
                      href="tel:+919876543210"
                      className="text-white font-medium hover:text-[#C9A84C] transition-colors duration-300 block mt-1"
                      style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div
                    className="flex items-center justify-center shrink-0 w-12 h-12 border border-[#C9A84C]/20 text-base"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "#C9A84C",
                    }}
                  >
                    ✉️
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(212, 197, 176, 0.4)",
                      }}
                    >
                      Email Concierge
                    </p>
                    <a
                      href="mailto:hello@3mcarrentals.com"
                      className="text-white font-medium hover:text-[#C9A84C] transition-colors duration-300 block mt-1"
                      style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}
                    >
                      hello@3mcarrentals.com
                    </a>
                  </div>
                </div>

                {/* Office */}
                <div className="flex gap-4">
                  <div
                    className="flex items-center justify-center shrink-0 w-12 h-12 border border-[#C9A84C]/20 text-base"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "#C9A84C",
                    }}
                  >
                    📍
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(212, 197, 176, 0.4)",
                      }}
                    >
                      Headquarters
                    </p>
                    <p
                      className="text-[#E8DCC8]/70 mt-2 text-sm font-light leading-relaxed"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Shop No. 7, Hotel Tree House, Neptune Inn, Opposite New Panjim Market, Near Municipal Market, Panjim, Goa - 403001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency WhatsApp Widget */}
            <div
              className="p-10 border border-[#C9A84C]/15 relative overflow-hidden"
              style={{
                background: "linear-gradient(to bottom right, rgba(201, 168, 76, 0.05), transparent)",
              }}
            >
              <h4
                className="text-white mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.375rem",
                  fontWeight: 400,
                }}
              >
                Need Immediate Help?
              </h4>
              <p
                className="text-[#E8DCC8]/50 leading-relaxed mb-8"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  fontWeight: 300,
                }}
              >
                If your flight is landing right now and you need immediate self-drive delivery, call us or ping our WhatsApp emergency response desk.
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#25d366] text-[#121210] font-semibold text-xs uppercase tracking-[0.12em] hover:bg-[#20ba5a] transition-all duration-300"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Launch Live Chat
              </a>
            </div>
          </div>

          {/* Inquiry form (Right block) */}
          <div className="lg:col-span-7">
            <div className="p-10 bg-white/[0.015] border border-white/[0.06]">
              <h3
                className="text-white mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.75rem",
                  fontWeight: 400,
                }}
              >
                Send an Inquiry
              </h3>
              <p
                className="text-[#E8DCC8]/40 mb-10 text-xs tracking-wide"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Fill in the details below and our reservations desk will email you a curated quote.
              </p>

              {submitted ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-2xl">
                    ✅
                  </div>
                  <h4
                    className="text-white mb-3"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.5rem",
                      fontWeight: 400,
                    }}
                  >
                    Inquiry Sent Successfully
                  </h4>
                  <p
                    className="text-[#E8DCC8]/50 text-sm leading-relaxed max-w-sm mx-auto mb-8 font-light"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
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
                    <label
                      className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Message / Trip Requirements
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="e.g. Arriving at Mopa Airport at 3 PM, would like to pick up a luxury SUV..."
                      rows={5}
                      required
                      className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#C9A84C] px-4 py-3 text-white text-sm outline-none transition-all duration-300 resize-none rounded-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary" size="lg" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Inquiry"}
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
