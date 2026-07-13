"use client";

import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 rounded-lg"
      id="site-logo"
      aria-label="3M Car Rentals Home"
    >
      <div className="relative animate-fade-in transition-transform duration-300 ease-out group-hover:scale-[1.03] flex items-center">
        <Image
          src="/logo.svg"
          alt="3M Car Rentals Logo"
          width={150}
          height={40}
          priority
          className="h-[30px] md:h-[36px] lg:h-[40px] w-auto object-contain pointer-events-none"
        />
      </div>
    </Link>
  );
}
