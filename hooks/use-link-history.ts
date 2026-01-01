"use client"

import { useState, useEffect, useCallback } from "react"

export interface LinkHistoryItem {
  id: string
  shortCode: string
  shortUrl: string
  originalUrl: string
  clicks: number
  createdAt: string
}

const STORAGE_KEY = "urlitrim_link_history"
const MAX_HISTORY_ITEMS = 10

export function useLinkHistory() {
  const [history, setHistory] = useState<LinkHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          // Ensure all items have clicks field (for backward compatibility)
          const parsed = JSON.parse(stored)
          const normalized = parsed.map((item: LinkHistoryItem) => ({
            ...item,
            clicks: item.clicks ?? 0,
          }))
          setHistory(normalized)

          // Auto-refresh clicks from server
          const updated = await Promise.all(
            normalized.map(async (item: LinkHistoryItem) => {
              try {
                const res = await fetch(`/api/links/${item.shortCode}`, { cache: 'no-store' })
                if (res.ok) {
                  const data = await res.json()
                  return { ...item, clicks: data.clicks }
                }
              } catch {
                // Keep original on error
              }
              return item
            })
          )
          setHistory(updated)
        }
      } catch (error) {
        console.error("Failed to load history:", error)
      }
      setIsLoaded(true)
    }

    loadHistory()
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (error) {
        console.error("Failed to save history:", error)
      }
    }
  }, [history, isLoaded])

  const addToHistory = useCallback((item: Omit<LinkHistoryItem, "id" | "createdAt" | "clicks"> & { clicks?: number }) => {
    const newItem: LinkHistoryItem = {
      ...item,
      clicks: item.clicks ?? 0,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    setHistory((prev) => {
      // Remove duplicate if exists (same shortCode)
      const filtered = prev.filter((h) => h.shortCode !== item.shortCode)
      // Add new item at the beginning, limit to MAX_HISTORY_ITEMS
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }, [])

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const refreshClicks = useCallback(async () => {
    if (history.length === 0) return

    const updated = await Promise.all(
      history.map(async (item) => {
        try {
          const res = await fetch(`/api/links/${item.shortCode}`, {
            cache: 'no-store',
          })
          if (res.ok) {
            const data = await res.json()
            return { ...item, clicks: data.clicks }
          }
        } catch {
          // Keep original on error
        }
        return item
      })
    )

    setHistory(updated)
  }, [history])

  return {
    history,
    isLoaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
    refreshClicks,
  }
}
