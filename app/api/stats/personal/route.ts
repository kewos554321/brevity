import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

// Common browsers list
const COMMON_BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Opera", "Other"]

// Common OS list
const COMMON_OS = ["Windows", "macOS", "iOS", "Android", "Linux", "Other"]

// Browser detection from user agent
function detectBrowser(userAgent: string | null): string {
  if (!userAgent) return "Other"
  const ua = userAgent.toLowerCase()

  if (ua.includes("edg/") || ua.includes("edge/")) return "Edge"
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera"
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome"
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari"
  if (ua.includes("firefox")) return "Firefox"

  return "Other"
}

// OS detection from user agent
function detectOS(userAgent: string | null): string {
  if (!userAgent) return "Other"
  const ua = userAgent.toLowerCase()

  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS"
  if (ua.includes("android")) return "Android"
  if (ua.includes("windows")) return "Windows"
  if (ua.includes("mac os x") || ua.includes("macos")) return "macOS"
  if (ua.includes("linux") && !ua.includes("android")) return "Linux"

  return "Other"
}

// Platform detection from referrer
function detectPlatform(referrer: string | null): string {
  if (!referrer) return "Direct"

  const ref = referrer.toLowerCase()

  // Social platforms
  if (ref.includes("line.me") || ref.includes("line.naver")) return "LINE"
  if (ref.includes("twitter.com") || ref.includes("t.co") || ref.includes("x.com")) return "Twitter/X"
  if (ref.includes("facebook.com") || ref.includes("fb.com") || ref.includes("fbcdn")) return "Facebook"
  if (ref.includes("instagram.com")) return "Instagram"
  if (ref.includes("linkedin.com")) return "LinkedIn"
  if (ref.includes("reddit.com")) return "Reddit"
  if (ref.includes("discord.com") || ref.includes("discord.gg")) return "Discord"
  if (ref.includes("telegram.org") || ref.includes("t.me")) return "Telegram"
  if (ref.includes("whatsapp.com")) return "WhatsApp"
  if (ref.includes("tiktok.com")) return "TikTok"
  if (ref.includes("youtube.com") || ref.includes("youtu.be")) return "YouTube"
  if (ref.includes("threads.net")) return "Threads"

  // Search engines
  if (ref.includes("google.")) return "Google"
  if (ref.includes("bing.com")) return "Bing"
  if (ref.includes("yahoo.")) return "Yahoo"
  if (ref.includes("duckduckgo.com")) return "DuckDuckGo"

  // Messaging apps
  if (ref.includes("slack.com")) return "Slack"
  if (ref.includes("teams.microsoft")) return "Teams"

  // Try to extract domain
  try {
    const url = new URL(referrer)
    return url.hostname.replace("www.", "")
  } catch {
    return "Other"
  }
}

// Country code to name mapping (common ones)
const countryNames: Record<string, string> = {
  TW: "Taiwan",
  US: "United States",
  JP: "Japan",
  CN: "China",
  HK: "Hong Kong",
  KR: "South Korea",
  SG: "Singapore",
  MY: "Malaysia",
  TH: "Thailand",
  VN: "Vietnam",
  PH: "Philippines",
  ID: "Indonesia",
  AU: "Australia",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  IN: "India",
}

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
        platforms: [],
        devices: { desktop: 0, mobile: 0, tablet: 0, other: 0 },
        browsers: [],
        operatingSystems: [],
        countries: [],
        clicksByHour: [],
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
        country: true,
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

    // Initialize hourly clicks (0-23)
    const hourlyClicks: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourlyClicks[i] = 0
    }

    // Initialize counters
    const platformCounts: Record<string, number> = {}
    const countryCounts: Record<string, number> = {}
    const browserCounts: Record<string, number> = {}
    const osCounts: Record<string, number> = {}
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0, other: 0 }

    clickEvents.forEach((click) => {
      // Daily trend
      const dateStr = new Date(click.timestamp).toISOString().split("T")[0]
      if (dailyClicks[dateStr] !== undefined) {
        dailyClicks[dateStr]++
      }

      // Hourly distribution
      const hour = new Date(click.timestamp).getHours()
      hourlyClicks[hour]++

      // Platform detection
      const platform = detectPlatform(click.referrer)
      platformCounts[platform] = (platformCounts[platform] || 0) + 1

      // Country
      const countryCode = click.country || "Unknown"
      const countryName = countryNames[countryCode] || countryCode
      countryCounts[countryName] = (countryCounts[countryName] || 0) + 1

      // Browser detection
      const browser = detectBrowser(click.userAgent)
      browserCounts[browser] = (browserCounts[browser] || 0) + 1

      // OS detection
      const os = detectOS(click.userAgent)
      osCounts[os] = (osCounts[os] || 0) + 1

      // Device detection
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

    // Format click trend
    const clickTrend = Object.entries(dailyClicks).map(([date, clicks]) => ({
      date,
      clicks,
    }))

    // Format hourly clicks
    const clicksByHour = Object.entries(hourlyClicks).map(([hour, clicks]) => ({
      hour: parseInt(hour),
      clicks,
    }))

    // Format platforms (top 6)
    const platforms = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([platform, count]) => ({ platform, count }))

    // Format countries (top 6)
    const countries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([country, count]) => ({ country, count }))

    // Format browsers (fixed order with all common browsers)
    const browsers = COMMON_BROWSERS.map((browser) => ({
      browser,
      count: browserCounts[browser] || 0,
    }))

    // Format OS (fixed order with all common OS)
    const operatingSystems = COMMON_OS.map((os) => ({
      os,
      count: osCounts[os] || 0,
    }))

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
      platforms,
      devices: deviceCounts,
      browsers,
      operatingSystems,
      countries,
      clicksByHour,
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
