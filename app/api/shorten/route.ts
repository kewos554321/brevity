import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateShortCode, isValidUrl, getBaseUrl } from "@/lib/utils"
import { rateLimit, getClientIP } from "@/lib/rate-limit"

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT = { limit: 10, window: 60 }

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const ip = getClientIP(request)
    const { success, remaining, reset } = rateLimit(ip, RATE_LIMIT)

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      )
    }

    const body = await request.json()
    const { url, ttl, password, oneTime, showPreview } = body

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Prevent shortening our own URLs (avoid redirect loops)
    const baseUrl = getBaseUrl()
    const urlObj = new URL(url)
    const baseUrlObj = new URL(baseUrl)
    if (urlObj.hostname === baseUrlObj.hostname) {
      return NextResponse.json(
        { error: "Cannot shorten Urlitrim URLs" },
        { status: 400 }
      )
    }

    // Generate unique short code
    let shortCode = generateShortCode()
    let attempts = 0
    const maxAttempts = 5

    // Check for collision and regenerate if needed
    while (attempts < maxAttempts) {
      const existing = await prisma.link.findUnique({
        where: { shortCode },
      })
      if (!existing) break
      shortCode = generateShortCode()
      attempts++
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique short code" },
        { status: 500 }
      )
    }

    // Calculate expiration date
    const expiresAt = ttl ? new Date(Date.now() + ttl * 24 * 60 * 60 * 1000) : null

    // Hash password if provided (simple hash for demo, use bcrypt in production)
    let hashedPassword = null
    if (password) {
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      hashedPassword = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: url,
        expiresAt,
        password: hashedPassword,
        maxClicks: oneTime ? 1 : null,
        showPreview: showPreview ?? false,
      },
    })

    const shortUrl = `${getBaseUrl()}/${link.shortCode}`

    return NextResponse.json({
      shortCode: link.shortCode,
      shortUrl,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      expiresAt: link.expiresAt,
    })
  } catch (error) {
    console.error("Error creating short URL:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
