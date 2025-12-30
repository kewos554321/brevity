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
})
