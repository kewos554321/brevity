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

    // Get referrer and user agent
    const referrer = request.headers.get("referer") || null
    const userAgent = request.headers.get("user-agent") || null

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing click:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
