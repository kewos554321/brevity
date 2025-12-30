import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Verify Vercel cron secret
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Delete expired links
    const result = await prisma.link.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      deleted: result.count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error cleaning up expired links:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
