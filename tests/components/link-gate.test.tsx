import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LinkGate } from "@/components/link-gate"

// Mock fetch
global.fetch = vi.fn()

describe("LinkGate", () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Password Protection", () => {
    it("should render password form when hasPassword is true", () => {
      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={true}
          showPreview={false}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText("Password Protected")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Unlock" })).toBeInTheDocument()
    })

    it("should disable submit button when password is empty", () => {
      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={true}
          showPreview={false}
          onSuccess={mockOnSuccess}
        />
      )

      const button = screen.getByRole("button", { name: "Unlock" })
      expect(button).toBeDisabled()
    })

    it("should show error on invalid password", async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid password" }),
      })

      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={true}
          showPreview={false}
          onSuccess={mockOnSuccess}
        />
      )

      const input = screen.getByPlaceholderText("Enter password")
      await userEvent.type(input, "wrongpassword")

      const button = screen.getByRole("button", { name: "Unlock" })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText("Invalid password")).toBeInTheDocument()
      })
    })

    it("should show fallback error when API returns no error message", async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      })

      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={true}
          showPreview={false}
          onSuccess={mockOnSuccess}
        />
      )

      const input = screen.getByPlaceholderText("Enter password")
      await userEvent.type(input, "wrongpassword")

      const button = screen.getByRole("button", { name: "Unlock" })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText("Invalid password")).toBeInTheDocument()
      })
    })

    it("should call onSuccess after valid password", async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={true}
          showPreview={false}
          onSuccess={mockOnSuccess}
        />
      )

      const input = screen.getByPlaceholderText("Enter password")
      await userEvent.type(input, "correctpassword")

      const button = screen.getByRole("button", { name: "Unlock" })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it("should show preview after password verified if showPreview is true", async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={true}
          showPreview={true}
          onSuccess={mockOnSuccess}
        />
      )

      const input = screen.getByPlaceholderText("Enter password")
      await userEvent.type(input, "correctpassword")

      const button = screen.getByRole("button", { name: "Unlock" })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText("Link Preview")).toBeInTheDocument()
      })
    })

    it("should handle fetch error", async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"))

      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={true}
          showPreview={false}
          onSuccess={mockOnSuccess}
        />
      )

      const input = screen.getByPlaceholderText("Enter password")
      await userEvent.type(input, "password")

      const button = screen.getByRole("button", { name: "Unlock" })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument()
      })
    })
  })

  describe("Preview Page", () => {
    it("should render preview page when showPreview is true and no password", () => {
      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={false}
          showPreview={true}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText("Link Preview")).toBeInTheDocument()
      expect(screen.getByText("https://example.com")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Continue to Site" })).toBeInTheDocument()
    })

    it("should call onSuccess when Continue button is clicked", async () => {
      render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={false}
          showPreview={true}
          onSuccess={mockOnSuccess}
        />
      )

      const button = screen.getByRole("button", { name: "Continue to Site" })
      fireEvent.click(button)

      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  describe("No Gate Required", () => {
    it("should render nothing when no password and no preview", () => {
      const { container } = render(
        <LinkGate
          shortCode="abc123"
          originalUrl="https://example.com"
          hasPassword={false}
          showPreview={false}
          onSuccess={mockOnSuccess}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })
})
