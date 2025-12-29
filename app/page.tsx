"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function Home() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
      toast.success("Copied to clipboard!")
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
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
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
                <div className="flex gap-3">
                  <div className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center overflow-hidden">
                    <span className="text-cyan-400 font-mono text-sm truncate">
                      {shortUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="h-12 px-6 rounded-xl font-medium text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
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

        {/* Footer */}
        <div className="absolute bottom-8 text-zinc-600 text-sm">
          Built with Next.js & Tailwind CSS
        </div>
      </div>
    </div>
  )
}
