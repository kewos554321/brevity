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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://urlitrim.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
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
    "短網址",
    "網址縮短",
    "免費短網址",
    "短連結",
    "連結追蹤",
  ],
  authors: [{ name: "Jay Wang" }],
  creator: "Jay Wang",
  publisher: "Urlitrim",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_TW"],
    url: "/",
    siteName: "Urlitrim",
    title: "Urlitrim - Free URL Shortener with Analytics & Password Protection",
    description: "Free URL shortener with click analytics, password protection, and one-time links. Shorten URLs instantly, track clicks in real-time, and keep your links secure.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urlitrim - Free URL Shortener with Analytics",
    description: "Free URL shortener with click analytics, password protection, and one-time links. Shorten URLs instantly and track clicks in real-time.",
    creator: "@urlitrim",
    site: "@urlitrim",
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
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-US": baseUrl,
      "zh-TW": baseUrl,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name: "Urlitrim",
      url: baseUrl,
      description: "Free URL shortener with click analytics, password protection, and one-time links.",
      inLanguage: ["en-US", "zh-TW"],
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${baseUrl}/#webapp`,
      name: "Urlitrim",
      description: "Free URL shortener with click analytics, password protection, and one-time links. Shorten URLs instantly, track clicks in real-time, and keep your links secure.",
      url: baseUrl,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      softwareVersion: "1.0.0",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      author: {
        "@type": "Person",
        name: "Jay Wang",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
        worstRating: "1",
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
      "@id": `${baseUrl}/#organization`,
      name: "Urlitrim",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.svg`,
        width: 512,
        height: 512,
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        email: "kewos554321@gmail.com",
        contactType: "customer support",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${baseUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Dashboard",
          item: `${baseUrl}/dashboard`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${baseUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Urlitrim free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Urlitrim is completely free to use. You can shorten unlimited URLs, track clicks, and use all features without any cost or signup.",
          },
        },
        {
          "@type": "Question",
          name: "How long do shortened URLs last?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can choose how long your shortened URLs last. Options include 1 day, 7 days, 30 days, 90 days, 1 year, or never expires.",
          },
        },
        {
          "@type": "Question",
          name: "Can I password protect my shortened URLs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, you can add password protection to any shortened URL. Visitors will need to enter the password before being redirected.",
          },
        },
        {
          "@type": "Question",
          name: "What analytics are available?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Urlitrim provides detailed analytics including total clicks, click trends over time, device types, browsers, operating systems, countries, and hourly click distribution.",
          },
        },
        {
          "@type": "Question",
          name: "What is a one-time link?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A one-time link is a shortened URL that automatically expires after being clicked once. It's perfect for sharing sensitive information securely.",
          },
        },
      ],
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
