import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { RedirectClient } from "./redirect-client"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ shortCode: string; slug?: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shortCode, slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://urlitrim.vercel.app"

  const link = await prisma.link.findUnique({
    where: { shortCode },
    select: { originalUrl: true, showPreview: true },
  })

  if (!link) {
    return {
      title: "Link Not Found",
      robots: { index: false },
    }
  }

  const slugText = slug?.join("/") || ""
  const displayTitle = slugText ? slugText.replace(/-/g, " ") : "Shortened Link"
  const truncatedUrl = link.originalUrl.substring(0, 100) + (link.originalUrl.length > 100 ? "..." : "")

  return {
    title: displayTitle,
    description: `Redirecting to: ${truncatedUrl}`,
    openGraph: {
      title: `${displayTitle} | Urlitrim`,
      description: `Shortened link redirecting to: ${truncatedUrl}`,
      url: `${baseUrl}/${shortCode}${slugText ? `/${slugText}` : ""}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${displayTitle} | Urlitrim`,
      description: `Shortened link redirecting to: ${truncatedUrl}`,
    },
    robots: {
      index: link.showPreview ? true : false,
      follow: true,
    },
  }
}

export default async function RedirectPage({ params }: Props) {
  const { shortCode } = await params
  // Note: slug is intentionally ignored - it's just for SEO/readability

  const link = await prisma.link.findUnique({
    where: { shortCode },
  })

  if (!link) {
    notFound()
  }

  // Check if link has expired
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    notFound()
  }

  // Check if max clicks reached (one-time link)
  if (link.maxClicks && link.clicks >= link.maxClicks) {
    notFound()
  }

  // If password required or preview enabled, show client component
  if (link.password || link.showPreview) {
    return (
      <RedirectClient
        shortCode={link.shortCode}
        originalUrl={link.originalUrl}
        hasPassword={!!link.password}
        showPreview={link.showPreview}
      />
    )
  }

  // Get request headers for analytics
  const headersList = await headers()
  const referrer = headersList.get("referer") || null
  const userAgent = headersList.get("user-agent") || null
  // Vercel provides geo headers
  const country = headersList.get("x-vercel-ip-country") || null

  // Increment click count and create click event
  await prisma.$transaction([
    prisma.link.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    }),
    prisma.click.create({
      data: {
        linkId: link.id,
        referrer,
        userAgent,
        country,
      },
    }),
  ])

  redirect(link.originalUrl)
}
