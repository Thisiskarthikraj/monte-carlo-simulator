/** Minutes since midnight (0–1439). */

const TIME_WORDS = {
  noon: 12 * 60,
  midday: 12 * 60,
  midnight: 0,
}

export const INTERVAL_PRESETS = {
  evening: { start: 17 * 60, end: 21 * 60, label: 'evening (5 PM – 9 PM)' },
  morning: { start: 6 * 60, end: 12 * 60, label: 'morning (6 AM – 12 PM)' },
  afternoon: { start: 12 * 60, end: 17 * 60, label: 'afternoon (12 PM – 5 PM)' },
}

/**
 * @param {string} fragment e.g. "10:00", "10 am", "6 PM"
 * @returns {{ minutes: number, label: string } | null}
 */
export function parseClockTime(fragment) {
  let s = fragment.trim().toLowerCase().replace(/\./g, '')
  if (!s) return null

  if (TIME_WORDS[s] !== undefined) {
    const minutes = TIME_WORDS[s]
    return { minutes, label: formatMinutes(minutes) }
  }

  const match = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!match) return null

  let hour = parseInt(match[1], 10)
  const minute = match[2] ? parseInt(match[2], 10) : 0
  const meridiem = match[3]?.toLowerCase()

  if (minute < 0 || minute > 59 || hour < 0 || hour > 24) return null

  if (meridiem === 'am') {
    if (hour === 12) hour = 0
  } else if (meridiem === 'pm') {
    if (hour !== 12) hour += 12
  } else if (hour <= 12 && !meridiem && s.includes(':')) {
    // 24h style when colon present
    if (hour === 24) hour = 0
  }

  if (hour > 23) return null
  const minutes = hour * 60 + minute
  return { minutes, label: formatMinutes(minutes) }
}

export function formatMinutes(minutes) {
  const h24 = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  const meridiem = h24 >= 12 ? 'PM' : 'AM'
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return m === 0 ? `${h12} ${meridiem}` : `${h12}:${String(m).padStart(2, '0')} ${meridiem}`
}

/**
 * Parse "between 10 am and 12 pm" from lowercased text.
 */
export function extractTimeRange(text) {
  const between = text.match(
    /between\s+(.+?)\s+and\s+(.+?)(?:\?|$|\s+(?:on|at|for|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
  )
  if (between) {
    const start = parseClockTime(between[1].trim())
    const end = parseClockTime(between[2].trim())
    if (start && end) {
      return {
        type: 'range',
        startMinutes: start.minutes,
        endMinutes: end.minutes,
        label: `${start.label} – ${end.label}`,
      }
    }
  }
  return null
}

export function extractPointTime(text) {
  const atMatch = text.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|noon|midnight)\b/i)
  if (atMatch) {
    const parsed = parseClockTime(atMatch[1])
    if (parsed) {
      return { type: 'point', minutes: parsed.minutes, label: parsed.label }
    }
  }

  const clockOnly = text.match(/\b(\d{1,2}:\d{2})\s*(am|pm)?\b/i)
  if (clockOnly) {
    const parsed = parseClockTime(clockOnly[0])
    if (parsed) {
      return { type: 'point', minutes: parsed.minutes, label: parsed.label }
    }
  }

  for (const [key, preset] of Object.entries(INTERVAL_PRESETS)) {
    if (text.includes(key)) {
      return {
        type: 'range',
        startMinutes: preset.start,
        endMinutes: preset.end,
        label: preset.label,
      }
    }
  }

  return null
}

/** Snap minutes to nearest grid (e.g. 15, 30, 60). */
export function snapToGranularity(minutes, granularityMinutes) {
  return Math.round(minutes / granularityMinutes) * granularityMinutes
}

export function minutesToTimeString(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function parseTimeField(value) {
  if (value == null || value === '') return { minutes: null, error: null }
  const parsed = parseClockTime(String(value).trim())
  if (!parsed) {
    return { minutes: null, error: `Invalid time: "${value}". Use formats like 10:00 or 10 AM.` }
  }
  return { minutes: parsed.minutes, error: null }
}
