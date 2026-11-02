"use client";

import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, ChevronUp, MapPin } from "lucide-react";

export default function FloatingContactDock() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Fixed Sticky Action Bar on Right Side (Exact functionality from Majestic Tours) */}
      <aside aria-label="Quick contact links" className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-2">
        {/* Call Now Tab */}
        <a
          href="tel:+919637901501"
          aria-label="Call 3M Car Rentals"
          className="group flex items-center bg-[#C9A84C] hover:bg-[#D4B55E] text-[#121210] pl-3 pr-2 py-2.5 rounded-l-xl shadow-2xl transition-all duration-300 hover:-translate-x-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider hidden group-hover:inline-block">
              Call Now
            </span>
            <div className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center">
              <Phone className="w-4 h-4 fill-current" />
            </div>
          </div>
        </a>

        {/* WhatsApp Now Tab */}
        <a
          href="https://api.whatsapp.com/send?phone=919637901501&text=Hello%203M%20Car%20Rentals,%20I%20want%20to%20book%20a%20car%20in%20Goa."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp 3M Car Rentals"
          className="group flex items-center bg-emerald-600 hover:bg-emerald-500 text-white pl-3 pr-2 py-2.5 rounded-l-xl shadow-2xl transition-all duration-300 hover:-translate-x-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider hidden group-hover:inline-block">
              WhatsApp Now
            </span>
            <div className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
          </div>
        </a>
      </aside>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[#1A1916] border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black flex items-center justify-center shadow-2xl transition"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
