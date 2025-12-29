import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"

interface Props {
  params: Promise<{ shortCode: string }>
}

export default async function RedirectPage({ params }: Props) {
  const { shortCode } = await params

  const link = await prisma.link.findUnique({
    where: { shortCode },
  })

  if (!link) {
    notFound()
  }

  // Increment click count (fire and forget)
  prisma.link.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  }).catch(console.error)

  redirect(link.originalUrl)
}
