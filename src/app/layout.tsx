import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3, Urbanist, Manrope } from "next/font/google";
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

// ── Premium heading typography ────────────────────────────────────────────────
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// ── Premium body typography ──────────────────────────────────────────────────
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://3mcarrentals.in"),
  title: {
    default: "Self-Drive Car Rentals in Goa",
    template: "%s | 3M Car Rentals",
  },
  description:
    "Book self-drive car rentals in Goa, with delivery to Mopa (GOX), Dabolim (GOI), hotels, and locations across Goa.",
  openGraph: {
    type: "website",
    siteName: "3M Car Rentals",
    title: "Self-Drive Car Rentals in Goa",
    description:
      "Book self-drive car rentals in Goa, with delivery to Mopa (GOX), Dabolim (GOI), hotels, and locations across Goa.",
    url: "https://3mcarrentals.in",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1360,
        height: 768,
        alt: "Car rental on a coastal road in Goa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Self-Drive Car Rentals in Goa | 3M Car Rentals",
    description:
      "Book self-drive car rentals in Goa, with delivery to airports, hotels, and locations across Goa.",
    images: ["/hero-bg.jpg"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "3M Car Rentals",
  url: "https://3mcarrentals.in",
  logo: "https://3mcarrentals.in/logo.svg",
  image: "https://3mcarrentals.in/hero-bg.jpg",
  description:
    "Self-drive car rentals in Goa, with delivery to airports, hotels, and locations across Goa.",
  telephone: "+91-9637901501",
  email: "3mcarrentals321@gmail.com",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Goa, India",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9637901501",
    contactType: "customer service",
    email: "3mcarrentals321@gmail.com",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${sourceSans3.variable} ${urbanist.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#121210] text-[#D4C5B0]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
