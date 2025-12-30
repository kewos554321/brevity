import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "@/app/api/cleanup/route"
import { NextRequest } from "next/server"

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    link: {
      deleteMany: vi.fn(),
    },
  },
}))

import { prisma } from "@/lib/db"

describe("GET /api/cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it("should return 401 if CRON_SECRET is set but authorization is missing", async () => {
    vi.stubEnv("CRON_SECRET", "mysecret")

    const request = new NextRequest("http://localhost:3000/api/cleanup", {
      method: "GET",
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
  })

  it("should return 401 if CRON_SECRET is set but authorization is wrong", async () => {
    vi.stubEnv("CRON_SECRET", "mysecret")

    const request = new NextRequest("http://localhost:3000/api/cleanup", {
      method: "GET",
      headers: {
        authorization: "Bearer wrongsecret",
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
  })

  it("should delete expired links with correct authorization", async () => {
    vi.stubEnv("CRON_SECRET", "mysecret")
    ;(prisma.link.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 5 })

    const request = new NextRequest("http://localhost:3000/api/cleanup", {
      method: "GET",
      headers: {
        authorization: "Bearer mysecret",
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.deleted).toBe(5)
    expect(prisma.link.deleteMany).toHaveBeenCalledWith({
      where: {
        expiresAt: {
          lt: expect.any(Date),
        },
      },
    })
  })

  it("should work without CRON_SECRET (no auth required)", async () => {
    vi.stubEnv("CRON_SECRET", "")
    ;(prisma.link.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 3 })

    const request = new NextRequest("http://localhost:3000/api/cleanup", {
      method: "GET",
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.deleted).toBe(3)
  })

  it("should return 500 on database error", async () => {
    vi.stubEnv("CRON_SECRET", "")
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(prisma.link.deleteMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"))

    const request = new NextRequest("http://localhost:3000/api/cleanup", {
      method: "GET",
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Internal server error")
    consoleSpy.mockRestore()
  })
})
