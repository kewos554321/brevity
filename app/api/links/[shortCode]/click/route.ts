import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ shortCode: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { shortCode } = await params

    const link = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Increment click count
    await prisma.link.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing click:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
