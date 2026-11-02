import React from "react";
import MajesticHero from "@/components/home/MajesticHero";
import MajesticFeatures from "@/components/home/MajesticFeatures";
import PublicFleetShowcase from "@/components/fleet/PublicFleetShowcase";
import MajesticTestimonials from "@/components/home/MajesticTestimonials";
import MajesticServices from "@/components/home/MajesticServices";
import FloatingContactDock from "@/components/shared/FloatingContactDock";

export const metadata = {
  title: "3M Car Rentals Goa || Call us - +91-9637901501",
  description:
    "3M Car Rentals provides one of the best taxi & self-drive car services in Goa. Airport Pickup & Drop (Mopa & Dabolim), North & South Goa Tours, Thar 4x4, Creta, Ertiga.",
  keywords:
    "3M Car Rentals, Self Drive Cars in Goa, Taxi Service in Goa, Mopa Airport Taxi, Dabolim car rental, Goa cab service, Thar rental Goa",
};

export default function HomePage() {
  return (
    <div className="bg-[#0F0E0C] text-[#E8DCC8] min-h-screen selection:bg-[#C9A84C] selection:text-black">
      {/* 1. Hero Slider + "Book Your Ride Now" Search Form with SVG Curve */}
      <MajesticHero />

      {/* 2. "Why People Like Us?" (Dot Features) + "About Us" with Image */}
      <div id="about">
        <MajesticFeatures />
      </div>

      {/* 3. "Popular Cars" Showcase with Star Badge & Call Stamps */}
      <PublicFleetShowcase />

      {/* 4. "Testimonials & Fun Facts" (Reviews Carousel + 4 CountUp Stat Cards) */}
      <MajesticTestimonials />

      {/* 5. "Our Popular Services" (Airport, Station, Tours with Call Stamp Badges) */}
      <MajesticServices />

      {/* 6. Sticky Floating Container (Fixed Call Now & WhatsApp Now on Right Edge) */}
      <FloatingContactDock />
    </div>
  );
}
