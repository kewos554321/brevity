import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://brevity.vercel.app"),
  title: {
    default: "Brevity - URL Shortener",
    template: "%s | Brevity",
  },
  description: "Simple and fast URL shortening service. Create short links, track clicks, and share with ease.",
  keywords: ["url shortener", "link shortener", "short url", "url shortening service", "brevity"],
  authors: [{ name: "Jay Wang" }],
  creator: "Jay Wang",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Brevity",
    title: "Brevity - URL Shortener",
    description: "Simple and fast URL shortening service. Create short links, track clicks, and share with ease.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brevity - URL Shortener",
    description: "Simple and fast URL shortening service. Create short links, track clicks, and share with ease.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Brevity",
  description: "Simple and fast URL shortening service. Create short links, track clicks, and share with ease.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://brevity.vercel.app",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Jay Wang",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
