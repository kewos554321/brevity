import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateShortCode, isValidUrl, getBaseUrl } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

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

    // Create the link
    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: url,
      },
    })

    const shortUrl = `${getBaseUrl()}/${link.shortCode}`

    return NextResponse.json({
      shortCode: link.shortCode,
      shortUrl,
      originalUrl: link.originalUrl,
    })
  } catch (error) {
    console.error("Error creating short URL:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
