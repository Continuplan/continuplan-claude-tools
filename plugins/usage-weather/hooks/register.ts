import type { Register, SessionCost, SessionRateLimit } from 'claude-code'

// Length of each plan window, used to work out how far through it we are.
const WINDOW_MS: Record<string, number> = {
  five_hour: 5 * 60 * 60 * 1000,
  seven_day: 7 * 24 * 60 * 60 * 1000,
}
const LABEL: Record<string, string> = { five_hour: '5-hour', seven_day: 'Weekly' }

// Forecast: at the current pace, how much of the allowance will be used by
// the time the window resets?
function weather(projected: number): string {
  if (projected < 50) return '☀️ Sunny'
  if (projected < 80) return '⛅ Fair'
  if (projected < 100) return '🌧️ Rain'
  if (projected < 150) return '⛈️ Storm'
  return '🔥 Heatwave'
}

function describe(limit: SessionRateLimit, now: number): string {
  const label = LABEL[limit.kind] ?? limit.kind
  const used = Math.round(limit.percentUsed)
  const length = WINDOW_MS[limit.kind]
  const resets = limit.resetsAt ? Date.parse(limit.resetsAt) : NaN
  if (!length || Number.isNaN(resets)) return `${label}: ${used}% used`

  const left = Math.max(0, resets - now)
  // Floor at 5% through the window so a fresh window doesn't read as a storm.
  const elapsed = Math.min(1, Math.max(0.05, 1 - left / length))
  const projected = limit.percentUsed / elapsed
  const hours = left / 3_600_000
  const resetText =
    hours >= 24 ? `${Math.round(hours / 24)}d` : hours >= 1 ? `${Math.round(hours)}h` : `${Math.round(left / 60_000)}m`
  return `${weather(projected)} ${label}: ${used}% used, resets in ${resetText}`
}

function line(limits: SessionRateLimit[], cost: SessionCost | undefined, now: number): string {
  if (limits.length > 0) return limits.map(l => describe(l, now)).join('  ·  ')
  // No plan-limit readings (not on a subscription, or none reported yet).
  return cost ? `🌡️ No plan reading yet · this session ≈ $${cost.usd.toFixed(2)}` : '🌡️ No plan reading yet'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const usage = await $.session.usage()
    $.ui.status(line(usage.rateLimits, usage.cost, await $.clock.now()))
    return result
  })

  on('session.measure', async ($, e, next) => {
    $.ui.status(line(e.rateLimits, e.cost, await $.clock.now()))
    return next(e)
  })
}
