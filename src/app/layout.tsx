import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "../styles/globals.css";

// ── Display: Cormorant Garamond — editorial serif for headlines ───────────────
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// ── Body: Source Sans 3 — refined sans-serif for body copy ───────────────────
const sourceSans3 = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "3M Car Rentals — Luxury Self-Drive Experiences in Goa",
  description:
    "Curated luxury self-drive experiences in Goa. Premium vehicles delivered to your door. Airport pickup at GOX & GOI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${sourceSans3.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#121210] text-[#D4C5B0]">
        {children}
      </body>
    </html>
  );
}
