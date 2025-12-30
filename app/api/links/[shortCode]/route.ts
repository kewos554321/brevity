import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getBaseUrl } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ shortCode: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { shortCode } = await params

    const link = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      shortCode: link.shortCode,
      shortUrl: `${getBaseUrl()}/${link.shortCode}`,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      createdAt: link.createdAt,
    })
  } catch (error) {
    console.error("Error fetching link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
