import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/links/[shortCode]/verify/route"
import { NextRequest } from "next/server"

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    link: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/db"

describe("POST /api/links/[shortCode]/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 404 if link not found", async () => {
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const request = new NextRequest("http://localhost:3000/api/links/abc123/verify", {
      method: "POST",
      body: JSON.stringify({ password: "test" }),
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe("Link not found")
  })

  it("should return 400 if no password required", async () => {
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1",
      shortCode: "abc123",
      password: null,
    })

    const request = new NextRequest("http://localhost:3000/api/links/abc123/verify", {
      method: "POST",
      body: JSON.stringify({ password: "test" }),
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("No password required")
  })

  it("should return 401 for invalid password", async () => {
    // Hash of "correctpassword"
    const hashedPassword = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1",
      shortCode: "abc123",
      password: hashedPassword,
    })

    const request = new NextRequest("http://localhost:3000/api/links/abc123/verify", {
      method: "POST",
      body: JSON.stringify({ password: "wrongpassword" }),
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Invalid password")
  })

  it("should return success for valid password", async () => {
    // Create hash for "testpassword"
    const encoder = new TextEncoder()
    const data = encoder.encode("testpassword")
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashedPassword = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      password: hashedPassword,
    })

    const request = new NextRequest("http://localhost:3000/api/links/abc123/verify", {
      method: "POST",
      body: JSON.stringify({ password: "testpassword" }),
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.originalUrl).toBe("https://example.com")
  })

  it("should return 500 on database error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"))

    const request = new NextRequest("http://localhost:3000/api/links/abc123/verify", {
      method: "POST",
      body: JSON.stringify({ password: "test" }),
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Internal server error")
    consoleSpy.mockRestore()
  })
})
