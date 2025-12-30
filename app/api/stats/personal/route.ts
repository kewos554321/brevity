import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shortCodes } = body

    if (!shortCodes || !Array.isArray(shortCodes) || shortCodes.length === 0) {
      return NextResponse.json(
        { error: "shortCodes array is required" },
        { status: 400 }
      )
    }

    // Get all links for these short codes
    const links = await prisma.link.findMany({
      where: {
        shortCode: { in: shortCodes },
      },
      select: {
        id: true,
        shortCode: true,
        clicks: true,
        createdAt: true,
      },
    })

    if (links.length === 0) {
      return NextResponse.json({
        totalLinks: 0,
        totalClicks: 0,
        clickTrend: [],
        topReferrers: [],
        devices: { desktop: 0, mobile: 0, tablet: 0, other: 0 },
        topLinks: [],
      })
    }

    const linkIds = links.map((l) => l.id)

    // Get click events for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const clickEvents = await prisma.click.findMany({
      where: {
        linkId: { in: linkIds },
        timestamp: { gte: sevenDaysAgo },
      },
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
      try {
        const ref = click.referrer ? new URL(click.referrer).hostname : "Direct"
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1
      } catch {
        referrerCounts["Direct"] = (referrerCounts["Direct"] || 0) + 1
      }
    })

    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }))

    // Detect device types
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

    // Get top performing links
    const topLinks = links
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((link) => ({
        shortCode: link.shortCode,
        clicks: link.clicks,
        createdAt: link.createdAt,
      }))

    // Calculate totals
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)

    return NextResponse.json({
      totalLinks: links.length,
      totalClicks,
      clickTrend,
      topReferrers,
      devices: deviceCounts,
      topLinks,
    })
  } catch (error) {
    console.error("Error fetching personal stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
