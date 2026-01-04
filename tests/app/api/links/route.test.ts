import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "@/app/api/links/[shortCode]/route"
import { NextRequest } from "next/server"

// Mock utils
vi.mock("@/lib/utils", () => ({
  getBaseUrl: vi.fn(() => "http://localhost:3000"),
}))

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    link: {
      findUnique: vi.fn(),
    },
    click: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/db"

describe("GET /api/links/[shortCode]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 404 if link not found", async () => {
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const request = new NextRequest("http://localhost:3000/api/links/abc123")

    const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe("Link not found")
  })

  it("should return link details successfully", async () => {
    const mockLink = {
      id: "1",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      clicks: 42,
      createdAt: new Date("2024-01-01"),
    }
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)

    const request = new NextRequest("http://localhost:3000/api/links/abc123")

    const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.shortCode).toBe("abc123")
    expect(data.shortUrl).toBe("http://localhost:3000/abc123")
    expect(data.originalUrl).toBe("https://example.com")
    expect(data.clicks).toBe(42)
  })

  it("should return 500 on database error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"))

    const request = new NextRequest("http://localhost:3000/api/links/abc123")

    const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Internal server error")
    consoleSpy.mockRestore()
  })

  describe("detailed stats", () => {
    const mockLink = {
      id: "1",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      clicks: 10,
      createdAt: new Date("2024-01-01"),
      expiresAt: null,
    }

    it("should return detailed stats when detailed=true", async () => {
      ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)
      ;(prisma.click.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        {
          timestamp: new Date(),
          referrer: "https://google.com/search",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        {
          timestamp: new Date(),
          referrer: "https://twitter.com/post",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)",
        },
      ])

      const request = new NextRequest("http://localhost:3000/api/links/abc123?detailed=true")

      const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.clickTrend).toBeDefined()
      expect(data.topReferrers).toBeDefined()
      expect(data.devices).toBeDefined()
      expect(data.recentClicks).toBeDefined()
    })

    it("should correctly count device types", async () => {
      ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)
      ;(prisma.click.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { timestamp: new Date(), referrer: null, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        { timestamp: new Date(), referrer: null, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
        { timestamp: new Date(), referrer: null, userAgent: "Mozilla/5.0 (Linux; Android 10) Mobile" },
        { timestamp: new Date(), referrer: null, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)" },
        // iPad user agents contain "Mobile" in Safari
        { timestamp: new Date(), referrer: null, userAgent: "Mozilla/5.0 (iPad; CPU OS 14_0) Mobile Safari" },
        { timestamp: new Date(), referrer: null, userAgent: "SomeBot/1.0" },
      ])

      const request = new NextRequest("http://localhost:3000/api/links/abc123?detailed=true")

      const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
      const data = await response.json()

      expect(data.devices.desktop).toBe(2) // Windows + Mac
      expect(data.devices.mobile).toBe(2) // Android + iPhone
      expect(data.devices.tablet).toBe(1) // iPad (detected via mobile + ipad)
      expect(data.devices.other).toBe(1) // Bot
    })

    it("should handle clicks with Direct referrer", async () => {
      ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)
      ;(prisma.click.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { timestamp: new Date(), referrer: null, userAgent: "Mozilla/5.0" },
        { timestamp: new Date(), referrer: null, userAgent: null },
      ])

      const request = new NextRequest("http://localhost:3000/api/links/abc123?detailed=true")

      const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
      const data = await response.json()

      expect(data.topReferrers.length).toBeGreaterThanOrEqual(1)
      expect(data.topReferrers[0].source).toBe("Direct")
    })

    it("should aggregate clicks by day correctly", async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)
      ;(prisma.click.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { timestamp: today, referrer: null, userAgent: null },
        { timestamp: today, referrer: null, userAgent: null },
        { timestamp: yesterday, referrer: null, userAgent: null },
      ])

      const request = new NextRequest("http://localhost:3000/api/links/abc123?detailed=true")

      const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
      const data = await response.json()

      expect(data.clickTrend).toHaveLength(7)
      const todayEntry = data.clickTrend.find((d: { date: string }) => d.date === today.toISOString().split("T")[0])
      expect(todayEntry?.clicks).toBe(2)
    })

    it("should return empty arrays when no click events", async () => {
      ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)
      ;(prisma.click.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

      const request = new NextRequest("http://localhost:3000/api/links/abc123?detailed=true")

      const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
      const data = await response.json()

      expect(data.clickTrend).toHaveLength(7)
      expect(data.topReferrers).toHaveLength(0)
      expect(data.devices).toEqual({ desktop: 0, mobile: 0, tablet: 0, other: 0 })
      expect(data.recentClicks).toHaveLength(0)
    })

    it("should limit topReferrers to 5", async () => {
      ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)
      ;(prisma.click.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { timestamp: new Date(), referrer: "https://google.com", userAgent: null },
        { timestamp: new Date(), referrer: "https://twitter.com", userAgent: null },
        { timestamp: new Date(), referrer: "https://facebook.com", userAgent: null },
        { timestamp: new Date(), referrer: "https://reddit.com", userAgent: null },
        { timestamp: new Date(), referrer: "https://linkedin.com", userAgent: null },
        { timestamp: new Date(), referrer: "https://youtube.com", userAgent: null },
        { timestamp: new Date(), referrer: "https://github.com", userAgent: null },
      ])

      const request = new NextRequest("http://localhost:3000/api/links/abc123?detailed=true")

      const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
      const data = await response.json()

      expect(data.topReferrers.length).toBeLessThanOrEqual(5)
    })

    it("should limit recentClicks to 10", async () => {
      const clicks = Array.from({ length: 15 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 1000),
        referrer: null,
        userAgent: null,
      }))
      ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockLink)
      ;(prisma.click.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(clicks)

      const request = new NextRequest("http://localhost:3000/api/links/abc123?detailed=true")

      const response = await GET(request, { params: Promise.resolve({ shortCode: "abc123" }) })
      const data = await response.json()

      expect(data.recentClicks.length).toBeLessThanOrEqual(10)
    })
  })
})
