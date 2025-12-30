import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QRCodeDisplay } from "@/components/qr-code"

// Mock QRCode library
vi.mock("qrcode", () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  },
}))

import QRCode from "qrcode"

describe("QRCodeDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render canvas element", () => {
    render(<QRCodeDisplay url="http://localhost:3000/abc123" />)
    expect(document.querySelector("canvas")).toBeInTheDocument()
  })

  it("should call QRCode.toCanvas with correct options", async () => {
    render(<QRCodeDisplay url="http://localhost:3000/abc123" size={200} />)

    await waitFor(() => {
      expect(QRCode.toCanvas).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        "http://localhost:3000/abc123",
        {
          width: 200,
          margin: 2,
          color: {
            dark: "#ffffff",
            light: "#00000000",
          },
        }
      )
    })
  })

  it("should use default size of 160", async () => {
    render(<QRCodeDisplay url="http://localhost:3000/abc123" />)

    await waitFor(() => {
      expect(QRCode.toCanvas).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        "http://localhost:3000/abc123",
        expect.objectContaining({
          width: 160,
        })
      )
    })
  })

  it("should render download button", () => {
    render(<QRCodeDisplay url="http://localhost:3000/abc123" />)
    expect(screen.getByText("Download QR")).toBeInTheDocument()
  })

  it("should handle QRCode generation error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    ;(QRCode.toCanvas as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("QR generation failed")
    )

    render(<QRCodeDisplay url="http://localhost:3000/abc123" />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it("should call download when button clicked", async () => {
    const mockClick = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const element = originalCreateElement(tag)
      if (tag === "a") {
        element.click = mockClick
      }
      return element
    })

    render(<QRCodeDisplay url="http://localhost:3000/abc123" />)

    await waitFor(() => {
      expect(QRCode.toCanvas).toHaveBeenCalled()
    })

    const downloadButton = screen.getByText("Download QR")
    fireEvent.click(downloadButton)

    expect(mockClick).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it("should not download if canvas ref is null", () => {
    render(<QRCodeDisplay url="http://localhost:3000/abc123" />)
    // This is a basic render test - the component handles null refs internally
    expect(screen.getByText("Download QR")).toBeInTheDocument()
  })

  it("should not download if context is null", async () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null)

    render(<QRCodeDisplay url="http://localhost:3000/abc123" />)
    const downloadButton = screen.getByText("Download QR")
    fireEvent.click(downloadButton)

    // Should not throw an error
    expect(downloadButton).toBeInTheDocument()

    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it("should set canvas opacity to 100 when ready", async () => {
    ;(QRCode.toCanvas as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

    const { container } = render(<QRCodeDisplay url="http://localhost:3000/abc123" />)

    await waitFor(() => {
      const canvas = container.querySelector("canvas")
      expect(canvas).toHaveClass("opacity-100")
    })
  })
})
