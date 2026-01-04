import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { rateLimit, getClientIP } from "@/lib/rate-limit"

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should allow requests within limit", () => {
    const result = rateLimit("test-ip-1", { limit: 5, window: 60 })

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("should track remaining requests", () => {
    const identifier = "test-ip-2"
    const config = { limit: 3, window: 60 }

    const result1 = rateLimit(identifier, config)
    expect(result1.remaining).toBe(2)

    const result2 = rateLimit(identifier, config)
    expect(result2.remaining).toBe(1)

    const result3 = rateLimit(identifier, config)
    expect(result3.remaining).toBe(0)
  })

  it("should block requests when limit exceeded", () => {
    const identifier = "test-ip-3"
    const config = { limit: 2, window: 60 }

    rateLimit(identifier, config)
    rateLimit(identifier, config)
    const result = rateLimit(identifier, config)

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("should reset after window expires", () => {
    const identifier = "test-ip-4"
    const config = { limit: 2, window: 60 }

    rateLimit(identifier, config)
    rateLimit(identifier, config)

    // Advance time past the window
    vi.advanceTimersByTime(61 * 1000)

    const result = rateLimit(identifier, config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it("should use default config if not provided", () => {
    const result = rateLimit("test-ip-5")

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(9) // default limit is 10
  })

  it("should return reset timestamp", () => {
    const now = Date.now()
    vi.setSystemTime(now)

    const result = rateLimit("test-ip-6", { limit: 10, window: 60 })

    expect(result.reset).toBeGreaterThan(Math.ceil(now / 1000))
  })
})

describe("cleanup interval", () => {
  it("should clean up expired entries after 5 minutes", async () => {
    // Use fake timers
    vi.useFakeTimers()

    // Dynamically import to get fresh module with fake timers
    vi.resetModules()
    const { rateLimit: freshRateLimit } = await import("@/lib/rate-limit")

    const identifier = "cleanup-interval-test-ip"
    const config = { limit: 2, window: 1 } // 1 second window

    // Create an entry
    freshRateLimit(identifier, config)

    // Advance time past the window (entry expires)
    vi.advanceTimersByTime(2000)

    // Advance time to trigger cleanup interval (5 minutes)
    vi.advanceTimersByTime(5 * 60 * 1000)

    // The entry should be cleaned up, so next request should get fresh limit
    const result = freshRateLimit(identifier, config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)

    vi.useRealTimers()
  })
})

describe("getClientIP", () => {
  it("should return x-forwarded-for header if present", () => {
    const request = new Request("http://localhost:3000", {
      headers: {
        "x-forwarded-for": "192.168.1.1, 10.0.0.1",
      },
    })

    expect(getClientIP(request)).toBe("192.168.1.1")
  })

  it("should return first IP from x-forwarded-for list", () => {
    const request = new Request("http://localhost:3000", {
      headers: {
        "x-forwarded-for": "  203.0.113.1  , 198.51.100.1",
      },
    })

    expect(getClientIP(request)).toBe("203.0.113.1")
  })

  it("should return 'unknown' if no x-forwarded-for header", () => {
    const request = new Request("http://localhost:3000")

    expect(getClientIP(request)).toBe("unknown")
  })
})
