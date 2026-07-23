import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";

import "./globals.css";

// Body text — Inter, for legibility in a data-dense app (docs/DESIGN_SYSTEM.md).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Headings — Poppins 600–800, the "playful fintech" voice.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yieldly — Build your college list like a portfolio",
    template: "%s · Yieldly",
  },
  description:
    "Yieldly treats your college list like an investment portfolio: every school has a risk (admission odds) and a return (financial ROI). Swipe, diversify, and find scholarships worth your time.",
  applicationName: "Yieldly",
};

export const viewport: Viewport = {
  themeColor: "#0B1F4D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-dvh bg-surface">{children}</body>
    </html>
  );
}
