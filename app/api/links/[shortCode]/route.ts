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
    const url = new URL(request.url)
    const detailed = url.searchParams.get("detailed") === "true"

    const link = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      )
    }

    // Basic response
    const response: Record<string, unknown> = {
      shortCode: link.shortCode,
      shortUrl: `${getBaseUrl()}/${link.shortCode}`,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
    }

    // If detailed stats requested
    if (detailed) {
      // Get click trend for last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const clickEvents = await prisma.click.findMany({
        where: {
          linkId: link.id,
          timestamp: {
            gte: sevenDaysAgo,
          },
        },
        orderBy: { timestamp: "asc" },
        select: {
          timestamp: true,
          referrer: true,
          userAgent: true,
        },
      })

      // Aggregate clicks by day
      const dailyClicks: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        dailyClicks[dateStr] = 0
      }

      clickEvents.forEach((click) => {
        const dateStr = new Date(click.timestamp).toISOString().split("T")[0]
        if (dailyClicks[dateStr] !== undefined) {
          dailyClicks[dateStr]++
        }
      })

      const clickTrend = Object.entries(dailyClicks).map(([date, clicks]) => ({
        date,
        clicks,
      }))

      // Count referrers
      const referrerCounts: Record<string, number> = {}
      clickEvents.forEach((click) => {
        const ref = click.referrer ? new URL(click.referrer).hostname : "Direct"
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1
      })

      const topReferrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }))

      // Detect device types from user agent
      const deviceCounts = { desktop: 0, mobile: 0, tablet: 0, other: 0 }
      clickEvents.forEach((click) => {
        const ua = click.userAgent?.toLowerCase() || ""
        if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) {
          if (ua.includes("tablet") || ua.includes("ipad")) {
            deviceCounts.tablet++
          } else {
            deviceCounts.mobile++
          }
        } else if (ua.includes("windows") || ua.includes("mac") || ua.includes("linux")) {
          deviceCounts.desktop++
        } else {
          deviceCounts.other++
        }
      })

      response.clickTrend = clickTrend
      response.topReferrers = topReferrers
      response.devices = deviceCounts
      response.recentClicks = clickEvents.slice(-10).reverse()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching link:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
