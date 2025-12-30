import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, "localStorage", { value: localStorageMock })

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

// Mock crypto.randomUUID
Object.defineProperty(crypto, "randomUUID", {
  value: vi.fn(() => "test-uuid-1234"),
})

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillStyle: "",
  roundRect: vi.fn(),
  fill: vi.fn(),
  drawImage: vi.fn(),
})
HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue("data:image/png;base64,test")
