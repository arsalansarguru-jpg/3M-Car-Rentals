import type { Metadata } from "next";
import { Urbanist, Syncopate } from "next/font/google";
import "../styles/globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const syncopate = Syncopate({
  variable: "--font-syncopate",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "3M Car Rentals | Next-Gen Luxury Mobility",
  description: "Experience premium car rentals and concierge service in Goa. Search, book, and drive luxury vehicles seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${syncopate.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-gray-200">{children}</body>
    </html>
  );
}
