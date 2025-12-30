import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { RedirectClient } from "./redirect-client"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ shortCode: string; slug?: string[] }>
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
      },
    }),
  ])

  redirect(link.originalUrl)
}
