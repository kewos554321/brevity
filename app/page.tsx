"use client"

import { useState } from "react"
import { toast } from "sonner"
import { QRCodeDisplay } from "@/components/qr-code"
import { LinkHistory } from "@/components/link-history"
import { useLinkHistory } from "@/hooks/use-link-history"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Home() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [shortCode, setShortCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { history, addToHistory, removeFromHistory, clearHistory } = useLinkHistory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to shorten URL")
        return
      }

      setShortUrl(data.shortUrl)
      setShortCode(data.shortCode)

      // Add to history
      addToHistory({
        shortCode: data.shortCode,
        shortUrl: data.shortUrl,
        originalUrl: url,
      })

      toast.success("URL shortened successfully!")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
      <div className="absolute inset-0 bg-grid" />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-20 md:pt-32 px-4 pb-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-gradient-brand">Brevity</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-md mx-auto">
            Shorten your URLs with elegance.
            <br />
            <span className="text-zinc-500">Simple. Fast. Beautiful.</span>
          </p>
        </div>

        {/* Main card */}
        <div className="w-full max-w-xl">
          <div className="glass rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input */}
              <div className="relative group">
                <input
                  type="url"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300" />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Shortening...
                  </span>
                ) : (
                  "Shorten URL"
                )}
              </button>
            </form>

            {/* Result */}
            {shortUrl && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-sm text-zinc-500 mb-3">Your shortened URL</p>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center overflow-hidden">
                    <span className="text-cyan-400 font-mono text-sm truncate">
                      {shortUrl}
                    </span>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className={`h-12 w-12 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shrink-0 ${
                      copied
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                    title="Copy"
                  >
                    {copied ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

                  {/* QR Code Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="h-12 w-12 rounded-xl text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center shrink-0"
                        title="QR Code"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-white text-center">QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center py-4">
                        <QRCodeDisplay url={shortUrl} size={200} />
                        <p className="mt-4 text-sm text-zinc-400 text-center break-all px-4">
                          {shortUrl}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>

          {/* Stats or info */}
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Instant redirects</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure & private</span>
            </div>
          </div>
        </div>

        {/* History */}
        <LinkHistory
          history={history}
          onRemove={removeFromHistory}
          onClear={clearHistory}
        />

        {/* Footer */}
        <div className="mt-auto pt-12 text-zinc-600 text-sm">
          Built with Next.js & Tailwind CSS
        </div>
      </div>
    </div>
  )
}
