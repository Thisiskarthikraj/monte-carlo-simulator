const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/**
 * @param {Date} date
 * @returns {number} 0 = Sunday … 6 = Saturday
 */
export function getDayOfWeek(date) {
  return date.getDay()
}

export function dayNameToIndex(name) {
  const i = DAY_NAMES.indexOf(name.toLowerCase())
  return i >= 0 ? i : null
}

/**
 * Extract day-of-week from question text.
 */
export function extractDayOfWeek(text) {
  const lower = text.toLowerCase()
  for (let i = 0; i < DAY_NAMES.length; i++) {
    const re = new RegExp(`\\b${DAY_NAMES[i]}\\b`, 'i')
    if (re.test(lower)) {
      return { dayIndex: i, label: DAY_LABELS[i] }
    }
  }
  return null
}

export function extractDateHint(text) {
  const lower = text.toLowerCase()
  if (/\btomorrow\b/.test(lower)) {
    return { hint: 'tomorrow', label: 'tomorrow' }
  }
  if (/\btoday\b/.test(lower)) {
    return { hint: 'today', label: 'today' }
  }
  if (/\bnext week\b/.test(lower)) {
    return { hint: 'next_week', label: 'next week' }
  }
  return null
}

/**
 * Parse YYYY-MM-DD or common date strings.
 */
export function parseDateField(value) {
  if (!value || !String(value).trim()) {
    return { date: null, dayIndex: null, error: null }
  }
  const s = String(value).trim()
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const d = new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]))
    if (Number.isNaN(d.getTime())) {
      return { date: null, dayIndex: null, error: `Invalid date: ${s}` }
    }
    return { date: s, dayIndex: d.getUTCDay(), error: null }
  }
  return { date: null, dayIndex: null, error: `Use date format YYYY-MM-DD (got "${s}").` }
}

export function inferDayIndexFromDateString(dateStr) {
  const { dayIndex, error } = parseDateField(dateStr)
  if (error) return null
  return dayIndex
}
