import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/shorten/route"
import { NextRequest } from "next/server"

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    link: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock utils
vi.mock("@/lib/utils", () => ({
  generateShortCode: vi.fn(() => "abc1234"),
  isValidUrl: vi.fn((url: string) => url.startsWith("http")),
  getBaseUrl: vi.fn(() => "http://localhost:3000"),
}))

import { prisma } from "@/lib/db"
import { generateShortCode } from "@/lib/utils"

describe("POST /api/shorten", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 400 if URL is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("URL is required")
  })

  it("should return 400 if URL is invalid", async () => {
    const request = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "not-a-valid-url" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid URL format")
  })

  it("should create a shortened URL successfully", async () => {
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.link.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1",
      shortCode: "abc1234",
      originalUrl: "https://example.com",
    })

    const request = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.shortCode).toBe("abc1234")
    expect(data.shortUrl).toBe("http://localhost:3000/abc1234")
    expect(data.originalUrl).toBe("https://example.com")
  })

  it("should handle collision and regenerate short code", async () => {
    let callCount = 0
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++
      if (callCount < 3) {
        return Promise.resolve({ id: "existing" })
      }
      return Promise.resolve(null)
    })
    ;(prisma.link.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1",
      shortCode: "abc1234",
      originalUrl: "https://example.com",
    })

    const request = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(generateShortCode).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it("should return 500 if max collision attempts exceeded", async () => {
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "existing",
    })

    const request = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to generate unique short code")
  })

  it("should return 500 on database error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.link.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Database error")
    )

    const request = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Internal server error")
    consoleSpy.mockRestore()
  })
})
