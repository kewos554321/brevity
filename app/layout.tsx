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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://urlitrim.vercel.app"),
  title: {
    default: "Urlitrim - Free URL Shortener with Analytics & Password Protection",
    template: "%s | Urlitrim",
  },
  description: "Free URL shortener with click analytics, password protection, and one-time links. Shorten URLs instantly, track clicks in real-time, and keep your links secure. No signup required.",
  keywords: [
    "url shortener",
    "link shortener",
    "short url",
    "free url shortener",
    "shorten link",
    "click analytics",
    "link tracking",
    "password protected links",
    "one-time link",
    "secure url shortener",
    "qr code generator",
    "link analytics",
    "url tracker",
  ],
  authors: [{ name: "Jay Wang" }],
  creator: "Jay Wang",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Urlitrim",
    title: "Urlitrim - Free URL Shortener with Analytics & Password Protection",
    description: "Free URL shortener with click analytics, password protection, and one-time links. Shorten URLs instantly, track clicks in real-time, and keep your links secure.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urlitrim - Free URL Shortener with Analytics",
    description: "Free URL shortener with click analytics, password protection, and one-time links. Shorten URLs instantly and track clicks in real-time.",
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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://urlitrim.vercel.app";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Urlitrim",
      description: "Free URL shortener with click analytics, password protection, and one-time links. Shorten URLs instantly, track clicks in real-time, and keep your links secure.",
      url: baseUrl,
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
      featureList: [
        "Free URL shortening",
        "Click analytics and tracking",
        "Password protected links",
        "One-time self-destructing links",
        "QR code generation",
        "Custom link expiration",
        "No signup required",
      ],
    },
    {
      "@type": "Organization",
      name: "Urlitrim",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
  ],
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
