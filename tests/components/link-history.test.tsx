import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LinkHistory } from "@/components/link-history"
import { LinkHistoryItem } from "@/hooks/use-link-history"

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { toast } from "sonner"

describe("LinkHistory", () => {
  const mockHistory: LinkHistoryItem[] = [
    {
      id: "1",
      shortCode: "abc123",
      shortUrl: "http://localhost:3000/abc123",
      originalUrl: "https://example.com/very/long/url/that/should/be/truncated",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      shortCode: "def456",
      shortUrl: "http://localhost:3000/def456",
      originalUrl: "https://example2.com",
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    },
  ]

  const mockOnRemove = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return null when history is empty", () => {
    const { container } = render(
      <LinkHistory history={[]} onRemove={mockOnRemove} onClear={mockOnClear} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("should render history items", () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText("abc123")).toBeInTheDocument()
    expect(screen.getByText("def456")).toBeInTheDocument()
  })

  it("should display 'Recent Links' header", () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText("Recent Links")).toBeInTheDocument()
  })

  it("should call onClear when Clear all is clicked", () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    fireEvent.click(screen.getByText("Clear all"))
    expect(mockOnClear).toHaveBeenCalled()
  })

  it("should call onRemove when remove button is clicked", () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    const removeButtons = screen.getAllByTitle("Remove")
    fireEvent.click(removeButtons[0])
    expect(mockOnRemove).toHaveBeenCalledWith("1")
  })

  it("should copy to clipboard when copy button is clicked", async () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    const copyButtons = screen.getAllByTitle("Copy")
    fireEvent.click(copyButtons[0])

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "http://localhost:3000/abc123"
      )
    })

    expect(toast.success).toHaveBeenCalledWith("Copied!")
  })

  it("should show error toast when copy fails", async () => {
    ;(navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Copy failed")
    )

    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    const copyButtons = screen.getAllByTitle("Copy")
    fireEvent.click(copyButtons[0])

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to copy")
    })
  })

  it("should format date as 'Just now' for recent items", () => {
    const recentHistory: LinkHistoryItem[] = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: new Date().toISOString(),
      },
    ]

    render(
      <LinkHistory
        history={recentHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText("Just now")).toBeInTheDocument()
  })

  it("should format date as minutes ago", () => {
    const minutesAgoHistory: LinkHistoryItem[] = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
      },
    ]

    render(
      <LinkHistory
        history={minutesAgoHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText("5m ago")).toBeInTheDocument()
  })

  it("should format date as hours ago", () => {
    const hoursAgoHistory: LinkHistoryItem[] = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
      },
    ]

    render(
      <LinkHistory
        history={hoursAgoHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText("3h ago")).toBeInTheDocument()
  })

  it("should format date as days ago", () => {
    const daysAgoHistory: LinkHistoryItem[] = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
      },
    ]

    render(
      <LinkHistory
        history={daysAgoHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByText("2d ago")).toBeInTheDocument()
  })

  it("should format date as locale date for old items", () => {
    const oldHistory: LinkHistoryItem[] = [
      {
        id: "1",
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
      },
    ]

    render(
      <LinkHistory
        history={oldHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    // Should show locale date format, not relative time
    expect(screen.queryByText(/d ago/)).not.toBeInTheDocument()
  })

  it("should truncate long URLs", () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    // The long URL should be truncated with "..."
    const truncatedText = screen.getByText(/https:\/\/example\.com\/very\/long\/url.*\.\.\./)
    expect(truncatedText).toBeInTheDocument()
  })

  it("should not truncate short URLs", () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    // The short URL should not have "..."
    expect(screen.getByText("https://example2.com")).toBeInTheDocument()
  })

  it("should render refresh button when onRefresh is provided", () => {
    const mockOnRefresh = vi.fn()
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        onRefresh={mockOnRefresh}
      />
    )

    expect(screen.getByText("Refresh")).toBeInTheDocument()
  })

  it("should call onRefresh when refresh button is clicked", () => {
    const mockOnRefresh = vi.fn()
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
        onRefresh={mockOnRefresh}
      />
    )

    fireEvent.click(screen.getByText("Refresh"))
    expect(mockOnRefresh).toHaveBeenCalled()
  })

  it("should not render refresh button when onRefresh is not provided", () => {
    render(
      <LinkHistory
        history={mockHistory}
        onRemove={mockOnRemove}
        onClear={mockOnClear}
      />
    )

    expect(screen.queryByText("Refresh")).not.toBeInTheDocument()
  })
})
