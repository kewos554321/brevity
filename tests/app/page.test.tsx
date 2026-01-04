import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Home from "@/app/page"

// Mock fetch
global.fetch = vi.fn()

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the QRCodeDisplay component
vi.mock("@/components/qr-code", () => ({
  QRCodeDisplay: ({ url }: { url: string }) => (
    <div data-testid="qr-code">{url}</div>
  ),
}))

// Mock the LinkHistory component
vi.mock("@/components/link-history", () => ({
  LinkHistory: ({
    history,
    onRemove,
    onClear,
  }: {
    history: Array<{ id: string }>
    onRemove: (id: string) => void
    onClear: () => void
  }) => (
    <div data-testid="link-history">
      {history.map((item) => (
        <div key={item.id} data-testid={`history-item-${item.id}`}>
          <button onClick={() => onRemove(item.id)}>Remove</button>
        </div>
      ))}
      <button onClick={onClear}>Clear</button>
    </div>
  ),
}))

// Mock the useLinkHistory hook
vi.mock("@/hooks/use-link-history", () => ({
  useLinkHistory: vi.fn(() => ({
    history: [],
    addToHistory: vi.fn(),
    removeFromHistory: vi.fn(),
    clearHistory: vi.fn(),
  })),
}))

// Mock Dialog components
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogTrigger: ({
    children,
  }: {
    children: React.ReactNode
    asChild?: boolean
  }) => <div data-testid="dialog-trigger">{children}</div>,
}))

import { toast } from "sonner"
import { useLinkHistory } from "@/hooks/use-link-history"

describe("Home Page", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockReset()
  })

  it("should render the page title", () => {
    render(<Home />)
    // There are multiple "Urlitrim" elements (nav logo and header), so use getAllByText
    const urlitrimElements = screen.getAllByText("Urlitrim")
    expect(urlitrimElements.length).toBeGreaterThanOrEqual(1)
  })

  it("should render the subtitle", () => {
    render(<Home />)
    expect(screen.getByText("Shorten your URLs with elegance.")).toBeInTheDocument()
  })

  it("should render the URL input", () => {
    render(<Home />)
    expect(
      screen.getByPlaceholderText("Paste your long URL here...")
    ).toBeInTheDocument()
  })

  it("should render the submit button", () => {
    render(<Home />)
    expect(screen.getByText("Shorten URL")).toBeInTheDocument()
  })

  it("should update input value on change", async () => {
    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")

    await user.type(input, "https://example.com")
    expect(input).toHaveValue("https://example.com")
  })

  it("should not submit if URL is empty", async () => {
    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    fireEvent.submit(form)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("should not submit if URL is only whitespace", async () => {
    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "   ")
    fireEvent.submit(form)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("should show loading state during submission", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    shortCode: "abc123",
                    shortUrl: "http://localhost:3000/abc123",
                    originalUrl: "https://example.com",
                  }),
              }),
            100
          )
        )
    )

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    expect(screen.getByText("Shortening...")).toBeInTheDocument()
  })

  it("should display shortened URL after successful submission", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(
        screen.getAllByText("http://localhost:3000/abc123").length
      ).toBeGreaterThan(0)
    })
  })

  it("should show success toast after successful submission", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("URL shortened successfully!")
    })
  })

  it("should show error toast on API error", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid URL format" }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid URL format")
    })
  })

  it("should show fallback error toast when API returns no error message", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to shorten URL")
    })
  })

  it("should show generic error toast on fetch failure", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error")
    )

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong")
    })
  })

  it("should copy shortened URL to clipboard", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTitle("Copy")).toBeInTheDocument()
    })

    await user.click(screen.getByTitle("Copy"))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Copied to clipboard!")
    })
  })

  it("should show copied toast after copying", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTitle("Copy")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTitle("Copy"))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Copied to clipboard!")
    })
  })

  it("should show error toast when copy fails", async () => {
    // Mock clipboard to fail
    const originalClipboard = navigator.clipboard.writeText
    Object.assign(navigator.clipboard, {
      writeText: vi.fn().mockRejectedValue(new Error("Copy failed")),
    })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTitle("Copy")).toBeInTheDocument()
    })

    await user.click(screen.getByTitle("Copy"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to copy")
    })

    // Restore
    Object.assign(navigator.clipboard, { writeText: originalClipboard })
  })

  it("should add to history on successful submission", async () => {
    const mockAddToHistory = vi.fn()
    ;(useLinkHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      history: [],
      addToHistory: mockAddToHistory,
      removeFromHistory: vi.fn(),
      clearHistory: vi.fn(),
    })
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockAddToHistory).toHaveBeenCalledWith({
        shortCode: "abc123",
        shortUrl: "http://localhost:3000/abc123",
        originalUrl: "https://example.com",
      })
    })
  })

  it("should render LinkHistory component", () => {
    render(<Home />)
    expect(screen.getByTestId("link-history")).toBeInTheDocument()
  })

  it("should render footer", () => {
    render(<Home />)
    expect(screen.getByText("Built by Jay Wang")).toBeInTheDocument()
  })

  it("should show QR code button after successful submission", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)
    const input = screen.getByPlaceholderText("Paste your long URL here...")
    const form = input.closest("form")!

    await user.type(input, "https://example.com")
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByTitle("QR Code")).toBeInTheDocument()
    })
  })

  it("should toggle advanced options", async () => {
    render(<Home />)

    const toggleButton = screen.getByText("Advanced options")
    expect(screen.queryByText("Description")).not.toBeInTheDocument()

    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText(/Description/)).toBeInTheDocument()
      expect(screen.getByText(/Password/)).toBeInTheDocument()
      expect(screen.getByText(/One-time link/)).toBeInTheDocument()
      expect(screen.getByText(/Show preview/)).toBeInTheDocument()
    })
  })

  it("should show clear button when URL is entered", async () => {
    render(<Home />)

    const input = screen.getByPlaceholderText("Paste your long URL here...")
    expect(screen.queryByTitle("Clear")).not.toBeInTheDocument()

    await user.type(input, "https://example.com")

    // The X button should appear - look for the SVG with X path
    const clearButtons = screen.getAllByRole("button")
    const clearButton = clearButtons.find((btn) => btn.querySelector("svg path"))
    expect(clearButton).toBeDefined()
  })

  it("should clear URL when clear button is clicked", async () => {
    render(<Home />)

    const input = screen.getByPlaceholderText("Paste your long URL here...")
    await user.type(input, "https://example.com")
    expect(input).toHaveValue("https://example.com")

    // Find and click the clear button (the X button)
    const clearButtons = screen.getAllByRole("button")
    const clearButton = clearButtons.find((btn) => btn.querySelector("svg path[d*='M6 18L18 6']"))
    expect(clearButton).toBeDefined()

    await user.click(clearButton!)

    expect(input).toHaveValue("")
  })

  it("should change TTL when selecting never expires", async () => {
    render(<Home />)

    // Open advanced options
    fireEvent.click(screen.getByText("Advanced options"))

    await waitFor(() => {
      expect(screen.getByText(/Expires in:/)).toBeInTheDocument()
    })

    // Find the select dropdown and change TTL to "Never expires"
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "" } })

    // The select value should now be empty (null TTL)
    expect(select).toHaveValue("")
  })

  it("should change TTL when selecting a specific duration", async () => {
    render(<Home />)

    // Open advanced options
    fireEvent.click(screen.getByText("Advanced options"))

    await waitFor(() => {
      expect(screen.getByText(/Expires in:/)).toBeInTheDocument()
    })

    // Find the select dropdown and change TTL to 7 days
    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "7" } })

    // The select value should now be 7
    expect(select).toHaveValue("7")
  })

  it("should submit with advanced options", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          shortCode: "abc123",
          shortUrl: "http://localhost:3000/abc123",
          originalUrl: "https://example.com",
        }),
    })

    render(<Home />)

    // Open advanced options
    fireEvent.click(screen.getByText("Advanced options"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. my-product-launch")).toBeInTheDocument()
    })

    // Fill in the form
    const urlInput = screen.getByPlaceholderText("Paste your long URL here...")
    await user.type(urlInput, "https://example.com")

    // Fill description
    const descInput = screen.getByPlaceholderText("e.g. my-product-launch")
    await user.type(descInput, "my-link")

    // Fill password
    const passwordInput = screen.getByPlaceholderText("Enter password to protect link")
    await user.type(passwordInput, "secret123")

    // Toggle one-time
    const oneTimeToggle = screen.getByText("One-time link (expires after 1 click)")
    fireEvent.click(oneTimeToggle.closest("label")!)

    // Toggle preview
    const previewToggle = screen.getByText("Show preview before redirect")
    fireEvent.click(previewToggle.closest("label")!)

    // Submit
    const form = urlInput.closest("form")!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/shorten",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("password"),
        })
      )
    })
  })

})
