import React from "react";

export const metadata = {
  title: "3M Car Rentals | Owner Control Center",
  description: "Manage fleet visibility, customer bookings, and vehicle inventory for 3M Car Rentals Goa.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0E0C] text-[#E8DCC8] antialiased selection:bg-[#C9A84C] selection:text-black">
      {children}
    </div>
  );
}
