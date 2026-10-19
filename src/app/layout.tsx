import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Meridian designs private, slow, beautifully planned journeys to Santorini, Kyoto, Marrakech, Bali, Patagonia, Reykjavík, the Amalfi Coast and Cappadocia. Tell us where — we handle the rest.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meridian — Journeys, curated.",
    template: "%s · Meridian",
  },
  description,
  applicationName: "Meridian",
  keywords: [
    "luxury travel agency",
    "curated journeys",
    "tailor-made travel",
    "Santorini",
    "Kyoto",
    "Marrakech",
    "Bali",
    "Patagonia",
    "Reykjavík",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Meridian",
    title: "Meridian — Journeys, curated.",
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian — Journeys, curated.",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071226",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
