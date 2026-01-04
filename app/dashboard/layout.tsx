import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://urlitrim.vercel.app";

export const metadata: Metadata = {
  title: "Dashboard - Link Analytics & Management",
  description:
    "View your shortened URL analytics, track clicks in real-time, and manage all your links. See device types, browsers, countries, and click trends.",
  keywords: [
    "url analytics",
    "link dashboard",
    "click tracking",
    "link management",
    "url statistics",
    "連結分析",
    "短網址管理",
  ],
  openGraph: {
    title: "Dashboard - Urlitrim Link Analytics",
    description:
      "View your shortened URL analytics, track clicks in real-time, and manage all your links.",
    url: `${baseUrl}/dashboard`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - Urlitrim Link Analytics",
    description:
      "View your shortened URL analytics, track clicks in real-time, and manage all your links.",
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${baseUrl}/dashboard`,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
