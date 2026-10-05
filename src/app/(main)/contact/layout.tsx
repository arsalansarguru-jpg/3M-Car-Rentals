import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact 3M Car Rentals in Goa",
  description:
    "Contact 3M Car Rentals about self-drive car bookings, airport pickup, and vehicle delivery across Goa.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "https://3mcarrentals.in/contact" },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
