"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export function QRCodeDisplay({ url, size = 160 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: "#ffffff",
          light: "#00000000", // Transparent background
        },
      })
        .then(() => setIsReady(true))
        .catch(console.error)
    }
  }, [url, size])

  const handleDownload = () => {
    if (!canvasRef.current) return

    // Create a new canvas with background
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const padding = 20
    canvas.width = size + padding * 2
    canvas.height = size + padding * 2

    // Fill background
    ctx.fillStyle = "#18181b" // zinc-900
    ctx.roundRect(0, 0, canvas.width, canvas.height, 16)
    ctx.fill()

    // Draw QR code
    ctx.drawImage(canvasRef.current, padding, padding)

    // Download
    const link = document.createElement("a")
    link.download = `qr-${url.split("/").pop()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
        <canvas ref={canvasRef} className={isReady ? "opacity-100" : "opacity-0"} />
      </div>
      <button
        onClick={handleDownload}
        className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR
      </button>
    </div>
  )
}
