import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"

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

  // Increment click count
  await prisma.link.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  })

  redirect(link.originalUrl)
}
