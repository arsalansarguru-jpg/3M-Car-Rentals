"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  return (
    <header className="relative z-40 bg-[#121210]">
      {/* 1. Topbar (Exact Majestic Tours Structure) */}
      <div className="border-b border-white/5 bg-[#0C0B0A] text-xs text-zinc-300 py-2.5 hidden sm:block">
        <div className="max-w-[1300px] mx-auto px-6 flex items-center justify-between">
          {/* Socials / Brand Motto */}
          <div className="flex items-center gap-4 text-zinc-400">
            <span className="text-[11px] font-medium text-[#C9A84C]">
              ★ 3M Car Rentals Goa — Trusted Self-Drive & Airport Transfers
            </span>
          </div>

          {/* Contact with Icons */}
          <div className="flex items-center gap-6">
            <a
              href="tel:+919637901501"
              className="flex items-center gap-1.5 hover:text-[#C9A84C] transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>+91-9637901501</span>
            </a>

            <a
              href="mailto:3mcarrentals321@gmail.com"
              className="flex items-center gap-1.5 hover:text-[#C9A84C] transition"
            >
              <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>3mcarrentals321@gmail.com</span>
            </a>

            <div className="hidden lg:flex items-center gap-1.5 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Candolim & Airport Handover, Goa</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Menubar */}
      <div className="border-b border-white/10 bg-[#161512]">
        <div className="max-w-[1300px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#997E33] text-[#121210] font-black text-xl flex items-center justify-center shadow-lg shadow-[#C9A84C]/20">
              3M
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-wide block leading-none">
                3M Car Rentals
              </span>
              <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest block mt-0.5">
                Goa Self Drive
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider text-white hover:text-[#C9A84C] transition"
            >
              Home
            </Link>

            <Link
              href="#about"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-[#C9A84C] transition"
            >
              About Us
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                className="text-xs font-semibold uppercase tracking-wider text-zinc-300 group-hover:text-[#C9A84C] flex items-center gap-1 transition py-2"
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <div className="absolute left-0 top-full hidden group-hover:block w-64 bg-[#1A1916] border border-[#C9A84C]/30 rounded-xl shadow-2xl p-2 z-50">
                <Link
                  href="/airport"
                  className="block px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Airport Pickup & Drop (Mopa & Dabolim)
                </Link>
                <Link
                  href="#services"
                  className="block px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Railway Station Pickup & Drop
                </Link>
                <Link
                  href="#services"
                  className="block px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  North Goa Beach Tour
                </Link>
                <Link
                  href="#services"
                  className="block px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  South Goa Heritage Tour
                </Link>
                <Link
                  href="#fleet"
                  className="block px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Self-Drive Fleet & 4x4 Thar
                </Link>
              </div>
            </div>

            <Link
              href="#fleet"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-[#C9A84C] transition"
            >
              Popular Cars
            </Link>

            <Link
              href="#contact"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-[#C9A84C] transition"
            >
              Contact
            </Link>

            <Link
              href="/admin"
              className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
            >
              Owner Portal
            </Link>
          </nav>

          {/* Header Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="tel:+919637901501"
              className="px-5 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#C9A84C]/20 transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="lg:hidden p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#161512] px-6 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold uppercase tracking-wider text-white py-1.5"
            >
              Home
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 py-1.5"
            >
              About Us
            </Link>
            <Link
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 py-1.5"
            >
              Services (Airport & Sightseeing)
            </Link>
            <Link
              href="#fleet"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 py-1.5"
            >
              Popular Cars
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 py-1.5"
            >
              Contact
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold uppercase tracking-wider text-[#C9A84C] py-1.5"
            >
              Owner Portal
            </Link>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <a
                href="tel:+919637901501"
                className="w-full py-2.5 rounded-xl bg-[#C9A84C] text-[#121210] font-extrabold text-xs uppercase text-center"
              >
                Call: +91 9637901501
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=919637901501"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs uppercase text-center"
              >
                WhatsApp Chat
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
