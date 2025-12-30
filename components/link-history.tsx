"use client"

import { useState } from "react"
import { toast } from "sonner"
import { LinkHistoryItem } from "@/hooks/use-link-history"

interface LinkHistoryProps {
  history: LinkHistoryItem[]
  onRemove: (id: string) => void
  onClear: () => void
  onRefresh?: () => void
}

export function LinkHistory({ history, onRemove, onClear, onRefresh }: LinkHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (history.length === 0) {
    return null
  }

  const handleCopy = async (item: LinkHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.shortUrl)
      setCopiedId(item.id)
      toast.success("Copied!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }

  return (
    <div className="w-full max-w-xl mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-400">Recent Links</h2>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Refresh
            </button>
          )}
          <button
            onClick={onClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="group glass rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400 font-mono text-sm">
                    {item.shortCode}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-zinc-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {item.clicks}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs truncate">
                  {truncateUrl(item.originalUrl)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(item)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Copy"
                >
                  {copiedId === item.id ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
