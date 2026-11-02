"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0C0B0A] border-t border-white/10 text-zinc-400">
      {/* Footer Main Widgets (Exact Majestic Tours Structure) */}
      <div className="max-w-[1300px] mx-auto px-6 sm:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Column 1: Brand Info (col-md-4) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C] text-[#121210] font-black text-lg flex items-center justify-center">
                3M
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-wide">
                3M Car Rentals
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              3M Car Rentals provides you one of the best Airport Pickup & Drop, Railway Station Pickup & Drop, North Goa Tour, South Goa Tour, Taxi Service, and Self-Drive Car Services in Goa.
            </p>

            <div className="pt-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest block mb-2 font-semibold">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://api.whatsapp.com/send?phone=919637901501"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition"
                >
                  WhatsApp 24/7
                </a>
                <a
                  href="tel:+919637901501"
                  className="px-3 py-1.5 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 text-xs font-semibold hover:bg-[#C9A84C] hover:text-black transition"
                >
                  Direct Call
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (col-md-5) */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Quick Links
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Services Sub-column */}
              <ul className="space-y-2.5">
                <li>
                  <Link href="/airport" className="hover:text-[#C9A84C] transition">
                    Airport Pickup & Drop
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-[#C9A84C] transition">
                    Railway Station Pickup & Drop
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-[#C9A84C] transition">
                    North Goa Tour
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-[#C9A84C] transition">
                    South Goa Tour
                  </Link>
                </li>
                <li>
                  <Link href="#fleet" className="hover:text-[#C9A84C] transition">
                    Self-Drive Fleet
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-[#C9A84C] transition">
                    Outstation Cab Service
                  </Link>
                </li>
              </ul>

              {/* Navigation Sub-column */}
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="hover:text-[#C9A84C] transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-[#C9A84C] transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-[#C9A84C] transition">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="#fleet" className="hover:text-[#C9A84C] transition">
                    Popular Fleet
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-[#C9A84C] transition">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-[#C9A84C] hover:underline font-medium">
                    Owner Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Contact Us (col-md-3) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Contact Us
            </h3>

            <div className="space-y-3.5 text-xs">
              <a
                href="tel:+919637901501"
                className="flex items-start gap-3 hover:text-white transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#C9A84C] group-hover:text-black transition">
                  <Phone className="w-3.5 h-3.5 text-[#C9A84C] group-hover:text-black" />
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Phone Number</span>
                  <span className="font-semibold text-white">+91-9637901501</span>
                </div>
              </a>

              <a
                href="mailto:3mcarrentals321@gmail.com"
                className="flex items-start gap-3 hover:text-white transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#C9A84C] group-hover:text-black transition">
                  <Mail className="w-3.5 h-3.5 text-[#C9A84C] group-hover:text-black" />
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Email Address</span>
                  <span className="font-semibold text-white break-all">3mcarrentals321@gmail.com</span>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Location</span>
                  <span className="text-zinc-300">
                    House No. 155, Candolim & Mopa/Dabolim Airport Delivery, Goa 403515
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 bg-[#080706] py-5 text-xs text-zinc-500">
        <div className="max-w-[1300px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} 3M Car Rentals Goa. All rights reserved.</p>
          <p className="text-[11px]">
            Best Self-Drive & Taxi Services in Goa • Mopa (GOX) & Dabolim (GOI)
          </p>
        </div>
      </div>
    </footer>
  );
}
