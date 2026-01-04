"use client"

import { LinkGate } from "@/components/link-gate"

interface RedirectClientProps {
  shortCode: string
  originalUrl: string
  hasPassword: boolean
  showPreview: boolean
}

export function RedirectClient({ shortCode, originalUrl, hasPassword, showPreview }: RedirectClientProps) {

  const handleSuccess = async () => {
    // Increment click count via API
    try {
      await fetch(`/api/links/${shortCode}/click`, {
        method: "POST",
      })
    } catch {
      // Ignore errors, still redirect
    }

    // Redirect to original URL
    window.location.href = originalUrl
  }

  return (
    <LinkGate
      shortCode={shortCode}
      originalUrl={originalUrl}
      hasPassword={hasPassword}
      showPreview={showPreview}
      onSuccess={handleSuccess}
    />
  )
}
