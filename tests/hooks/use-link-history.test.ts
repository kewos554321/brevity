import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useLinkHistory } from "@/hooks/use-link-history"

describe("useLinkHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null)
  })

  it("should initialize with empty history", () => {
    const { result } = renderHook(() => useLinkHistory())
    expect(result.current.history).toEqual([])
  })

  it("should load history from localStorage", () => {
    const storedHistory = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify(storedHistory)
    )

    const { result } = renderHook(() => useLinkHistory())
    // History gets clicks: 0 added for backward compatibility
    expect(result.current.history).toEqual([
      { ...storedHistory[0], clicks: 0 }
    ])
  })

  it("should handle corrupted localStorage data", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      "invalid json"
    )

    const { result } = renderHook(() => useLinkHistory())
    expect(result.current.history).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it("should add item to history", () => {
    const { result } = renderHook(() => useLinkHistory())

    act(() => {
      result.current.addToHistory({
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
      })
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].shortCode).toBe("abc123")
    expect(result.current.history[0].id).toBe("test-uuid-1234")
  })

  it("should remove duplicate shortCodes when adding", () => {
    const { result } = renderHook(() => useLinkHistory())

    act(() => {
      result.current.addToHistory({
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
      })
    })

    act(() => {
      result.current.addToHistory({
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com/updated",
      })
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].originalUrl).toBe("https://example.com/updated")
  })

  it("should limit history to 10 items", () => {
    const { result } = renderHook(() => useLinkHistory())

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addToHistory({
          shortCode: `code${i}`,
          shortUrl: `http://localhost:3000/code${i}`,
          originalUrl: `https://example.com/${i}`,
        })
      }
    })

    expect(result.current.history).toHaveLength(10)
  })

  it("should remove item from history", () => {
    const storedHistory = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        shortCode: "def456",
        shortUrl: "http://localhost:3000/def456",
        originalUrl: "https://example2.com",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify(storedHistory)
    )

    const { result } = renderHook(() => useLinkHistory())

    act(() => {
      result.current.removeFromHistory("1")
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].id).toBe("2")
  })

  it("should clear all history", () => {
    const storedHistory = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify(storedHistory)
    )

    const { result } = renderHook(() => useLinkHistory())

    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.history).toEqual([])
  })

  it("should save history to localStorage when changed", async () => {
    const { result } = renderHook(() => useLinkHistory())

    act(() => {
      result.current.addToHistory({
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
      })
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "brevity_link_history",
      expect.any(String)
    )
  })

  it("should handle localStorage save error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Storage full")
    })

    const { result } = renderHook(() => useLinkHistory())

    act(() => {
      result.current.addToHistory({
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
      })
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it("should set isLoaded to true after initialization", () => {
    const { result } = renderHook(() => useLinkHistory())
    expect(result.current.isLoaded).toBe(true)
  })
})
