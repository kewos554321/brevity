"use client"

import { useState, useEffect, useCallback } from "react"

export interface LinkHistoryItem {
  id: string
  shortCode: string
  shortUrl: string
  originalUrl: string
  createdAt: string
}

const STORAGE_KEY = "brevity_link_history"
const MAX_HISTORY_ITEMS = 10

export function useLinkHistory() {
  const [history, setHistory] = useState<LinkHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load history:", error)
    }
    setIsLoaded(true)
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

  const addToHistory = useCallback((item: Omit<LinkHistoryItem, "id" | "createdAt">) => {
    const newItem: LinkHistoryItem = {
      ...item,
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

  return {
    history,
    isLoaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
}
