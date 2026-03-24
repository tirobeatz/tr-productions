// Simple in-memory rate limiter
const rateMap = new Map()

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateMap) {
    if (now - data.start > data.window) rateMap.delete(key)
  }
}, 5 * 60 * 1000)

export function rateLimit({ key, limit = 10, window = 60 * 1000 }) {
  const now = Date.now()
  const entry = rateMap.get(key)

  if (!entry || now - entry.start > window) {
    rateMap.set(key, { count: 1, start: now, window })
    return { limited: false, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { limited: true, remaining: 0 }
  }

  return { limited: false, remaining: limit - entry.count }
}
