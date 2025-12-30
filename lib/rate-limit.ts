// Simple in-memory rate limiter
// For production, use Redis or Upstash

interface RateLimitEntry {
  count: number
  resetAt: number
}

const requests = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of requests.entries()) {
    if (entry.resetAt < now) {
      requests.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  limit: number // max requests
  window: number // time window in seconds
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 10, window: 60 }
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const windowMs = config.window * 1000
  const entry = requests.get(identifier)

  if (!entry || entry.resetAt < now) {
    // New window
    requests.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })
    return {
      success: true,
      remaining: config.limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    }
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil(entry.resetAt / 1000),
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: Math.ceil(entry.resetAt / 1000),
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return "unknown"
}
