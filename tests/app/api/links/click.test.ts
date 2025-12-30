import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/links/[shortCode]/click/route"
import { NextRequest } from "next/server"

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    link: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/db"

describe("POST /api/links/[shortCode]/click", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 404 if link not found", async () => {
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const request = new NextRequest("http://localhost:3000/api/links/abc123/click", {
      method: "POST",
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe("Link not found")
  })

  it("should increment click count successfully", async () => {
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1",
      shortCode: "abc123",
      clicks: 5,
    })
    ;(prisma.link.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1",
      shortCode: "abc123",
      clicks: 6,
    })

    const request = new NextRequest("http://localhost:3000/api/links/abc123/click", {
      method: "POST",
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(prisma.link.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { clicks: { increment: 1 } },
    })
  })

  it("should return 500 on database error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(prisma.link.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"))

    const request = new NextRequest("http://localhost:3000/api/links/abc123/click", {
      method: "POST",
    })

    const response = await POST(request, { params: Promise.resolve({ shortCode: "abc123" }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Internal server error")
    consoleSpy.mockRestore()
  })
})
