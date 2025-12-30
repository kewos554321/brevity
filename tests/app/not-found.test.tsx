import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import NotFound from "@/app/not-found"

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock window.history
const mockBack = vi.fn()
Object.defineProperty(window, "history", {
  value: { back: mockBack },
  writable: true,
})

describe("NotFound Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render 404 error code", () => {
    render(<NotFound />)
    expect(screen.getByText("404")).toBeInTheDocument()
  })

  it("should render error title", () => {
    render(<NotFound />)
    expect(screen.getByText("Link Not Found")).toBeInTheDocument()
  })

  it("should render error description", () => {
    render(<NotFound />)
    expect(
      screen.getByText("This link may have expired, been deleted, or never existed.")
    ).toBeInTheDocument()
  })

  it("should render Create New Link button with correct href", () => {
    render(<NotFound />)
    const link = screen.getByRole("link", { name: "Create New Link" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/")
  })

  it("should render Go Back button", () => {
    render(<NotFound />)
    expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument()
  })

  it("should call window.history.back when Go Back is clicked", () => {
    render(<NotFound />)
    const button = screen.getByRole("button", { name: "Go Back" })
    fireEvent.click(button)
    expect(mockBack).toHaveBeenCalled()
  })

  it("should render contact info", () => {
    render(<NotFound />)
    expect(
      screen.getByText("If you believe this is an error, please contact us.")
    ).toBeInTheDocument()
  })
})
