"use client"

import { useState } from "react"

interface LinkGateProps {
  shortCode: string
  originalUrl: string
  hasPassword: boolean
  showPreview: boolean
  onSuccess: () => void
}

export function LinkGate({ shortCode, originalUrl, hasPassword, showPreview, onSuccess }: LinkGateProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordVerified, setPasswordVerified] = useState(!hasPassword)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/links/${shortCode}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setPasswordVerified(true)
        if (!showPreview) {
          onSuccess()
        }
      } else {
        const data = await res.json()
        setError(data.error || "Invalid password")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    onSuccess()
  }

  // Password form
  if (!passwordVerified) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="glass rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-white mb-2">Password Protected</h1>
                <p className="text-zinc-400 text-sm">This link requires a password to access</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  autoFocus
                />

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? "Verifying..." : "Unlock"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Preview page
  if (showPreview) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="glass rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-white mb-2">Link Preview</h1>
                <p className="text-zinc-400 text-sm mb-4">You are about to be redirected to:</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6 break-all">
                <p className="text-cyan-400 text-sm font-mono">{originalUrl}</p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300"
              >
                Continue to Site
              </button>

              <p className="text-zinc-600 text-xs text-center mt-4">
                Make sure you trust this URL before continuing
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
