"use client"

import { useState } from "react"
import Link from "next/link"
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
  const [description, setDescription] = useState("")
  const [ttl, setTtl] = useState<number | null>(1) // days, default 1 day
  const [password, setPassword] = useState("")
  const [oneTime, setOneTime] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [shortUrl, setShortUrl] = useState("")
  const [shortCode, setShortCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const ttlOptions = [
    { value: null, label: "Never expires" },
    { value: 1, label: "1 day" },
    { value: 7, label: "7 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "90 days" },
    { value: 365, label: "1 year" },
  ]

  const { history, addToHistory, removeFromHistory, clearHistory, refreshClicks } = useLinkHistory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          ttl,
          password: password || undefined,
          oneTime,
          showPreview,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to shorten URL")
        return
      }

      // Append description slug if provided
      const slug = description.trim()
        ? "/" + description.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : ""
      const finalUrl = data.shortUrl + slug

      setShortUrl(finalUrl)
      setShortCode(data.shortCode)
      setDescription("")
      setPassword("")
      setOneTime(false)
      setShowPreview(false)

      // Add to history
      addToHistory({
        shortCode: data.shortCode,
        shortUrl: finalUrl,
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
        {/* Top Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
          <div className="text-lg font-bold text-gradient-brand">Urlitrim</div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">My Dashboard</span>
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-gradient-brand">Urlitrim</span>
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
                  className="w-full h-14 px-5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300" />
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced options
              </button>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-4 pt-2">
                  {/* Description Input */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Description <span className="text-zinc-600">(optional, for SEO)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. my-product-launch"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={50}
                      className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                    />
                    <p className="mt-1 text-xs text-zinc-600">Will be appended to URL: /abc123/your-description</p>
                  </div>

                  {/* TTL Select */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">Expires in:</span>
                    <select
                      value={ttl === null ? "" : ttl}
                      onChange={(e) => setTtl(e.target.value === "" ? null : Number(e.target.value))}
                      className="flex-1 h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-300 cursor-pointer"
                    >
                      {ttlOptions.map((option) => (
                        <option key={option.label} value={option.value === null ? "" : option.value} className="bg-zinc-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password Protection */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Password <span className="text-zinc-600">(optional)</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter password to protect link"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                    />
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-3">
                    {/* One-time Link */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={oneTime}
                          onChange={(e) => setOneTime(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-blue-600 transition-colors" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                      </div>
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-300">One-time link (expires after 1 click)</span>
                    </label>

                    {/* Show Preview */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showPreview}
                          onChange={(e) => setShowPreview(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-blue-600 transition-colors" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                      </div>
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-300">Show preview before redirect</span>
                    </label>

                  </div>
                </div>
              )}

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
          onRefresh={refreshClicks}
        />

        {/* Footer */}
        <div className="mt-auto pt-12 text-center text-zinc-600 text-sm space-y-2">
          <p>&copy; {new Date().getFullYear()} Urlitrim. All rights reserved.</p>
          <p>Built by Jay Wang</p>
          <p>
            Questions? <a href="mailto:kewos554321@gmail.com" className="hover:text-zinc-400 transition-colors">kewos554321@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
