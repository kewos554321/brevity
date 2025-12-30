import { describe, it, expect, vi, beforeEach } from "vitest"
import { cn, generateShortCode, isValidUrl, getBaseUrl } from "@/lib/utils"

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  it("should handle empty inputs", () => {
    expect(cn()).toBe("")
  })

  it("should handle undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
  })
})

describe("generateShortCode", () => {
  it("should generate a short code with default length", () => {
    const code = generateShortCode()
    expect(code).toHaveLength(7)
  })

  it("should generate a short code with custom length", () => {
    const code = generateShortCode(10)
    expect(code).toHaveLength(10)
  })

  it("should generate unique codes", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateShortCode()))
    expect(codes.size).toBe(100)
  })
})

describe("isValidUrl", () => {
  it("should return true for valid http URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true)
    expect(isValidUrl("http://example.com/path")).toBe(true)
    expect(isValidUrl("http://example.com/path?query=1")).toBe(true)
  })

  it("should return true for valid https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true)
    expect(isValidUrl("https://example.com/path")).toBe(true)
    expect(isValidUrl("https://sub.example.com")).toBe(true)
  })

  it("should return false for invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false)
    expect(isValidUrl("")).toBe(false)
    expect(isValidUrl("example.com")).toBe(false)
  })

  it("should return false for non-http/https protocols", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false)
    expect(isValidUrl("file:///path/to/file")).toBe(false)
    expect(isValidUrl("javascript:alert(1)")).toBe(false)
  })
})

describe("getBaseUrl", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it("should return BASE_URL from environment", () => {
    vi.stubEnv("BASE_URL", "https://example.com")
    expect(getBaseUrl()).toBe("https://example.com")
  })

  it("should return VERCEL_URL with https prefix", () => {
    vi.stubEnv("BASE_URL", "")
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app")
    expect(getBaseUrl()).toBe("https://my-app.vercel.app")
  })

  it("should return localhost as fallback", () => {
    vi.stubEnv("BASE_URL", "")
    vi.stubEnv("VERCEL_URL", "")
    expect(getBaseUrl()).toBe("http://localhost:3000")
  })
})
