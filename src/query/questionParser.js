import { extractDayOfWeek, extractDateHint } from './dateParser.js'
import { extractPointTime, extractTimeRange } from './timeParser.js'

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'i',
  'we',
  'you',
  'my',
  'our',
  'your',
  'should',
  'can',
  'could',
  'would',
  'will',
  'expect',
  'expected',
  'prepare',
  'plan',
  'for',
  'at',
  'on',
  'in',
  'to',
  'of',
  'how',
  'many',
  'much',
  'what',
  'is',
  'are',
  'do',
  'need',
  'tomorrow',
  'today',
  'next',
  'about',
  'approximately',
  'around',
  'between',
  'and',
  'from',
  'through',
  'during',
  'be',
  'have',
  'there',
  'that',
  'this',
  'see',
  'get',
  'make',
  'handle',
  'serve',
  'order',
  'orders',
])

const CONFIDENCE_PATTERNS = [
  { re: /\b99\s*%?\s*(?:planning|confidence|sure|safe)?/i, value: 99 },
  { re: /\b95\s*%?\s*(?:planning|confidence|sure|safe)?/i, value: 95 },
  { re: /\b90\s*%?\s*(?:planning|confidence|sure|safe)?/i, value: 90 },
  { re: /\b80\s*%?\s*(?:planning|confidence|sure|safe)?/i, value: 80 },
  { re: /\b75\s*%?\s*(?:planning|confidence|sure|safe)?/i, value: 75 },
  { re: /\b50\s*%?\s*(?:planning|confidence|sure|safe)?/i, value: 50 },
]

const WHOLE_DAY_PHRASES = [
  'all day',
  'whole day',
  'entire day',
  'full day',
  'throughout the day',
  'for the day',
  'per day',
]

/**
 * @typedef {'point' | 'range' | 'whole_day' | 'unspecified'} TimeScope
 */

/**
 * Parse a natural-language planning question (local rules, no LLM).
 * @param {string} question
 * @returns {import('./questionParser.types.js').ParsedQuestion}
 */
export function parseQuestion(question) {
  const raw = question.trim()
  const lower = raw.toLowerCase()

  if (!raw) {
    return emptyParse(raw, 'Enter a question about what you want to estimate.')
  }

  const target = extractTarget(raw, lower)
  const day = extractDayOfWeek(lower)
  const dateHint = extractDateHint(lower)
  const timeRange = extractTimeRange(lower)
  const pointTime = timeRange ? null : extractPointTime(lower)

  let time = /** @type {import('./questionParser.types.js').ParsedTime} */ ({
    scope: 'unspecified',
  })

  if (timeRange) {
    time = {
      scope: 'range',
      startMinutes: timeRange.startMinutes,
      endMinutes: timeRange.endMinutes,
      label: timeRange.label,
    }
  } else if (pointTime) {
    time = {
      scope: 'point',
      minutes: pointTime.minutes,
      label: pointTime.label,
    }
  } else if (WHOLE_DAY_PHRASES.some((p) => lower.includes(p))) {
    time = { scope: 'whole_day', label: 'full day' }
  }

  const planningConfidence = extractPlanningConfidence(lower)

  const ambiguity = detectAmbiguity(lower, time, dateHint, day)

  return {
    raw,
    target: target?.key ?? null,
    targetLabel: target?.label ?? null,
    dayOfWeek: day?.dayIndex ?? null,
    dayLabel: day?.label ?? null,
    dateHint: dateHint?.hint ?? null,
    dateLabel: dateHint?.label ?? null,
    time,
    planningConfidence,
    ambiguity,
    parseNotes: buildParseNotes(target, day, dateHint, time),
    error: null,
  }
}

function emptyParse(raw, message) {
  return {
    raw,
    target: null,
    targetLabel: null,
    dayOfWeek: null,
    dayLabel: null,
    dateHint: null,
    dateLabel: null,
    time: { scope: 'unspecified' },
    planningConfidence: null,
    ambiguity: { needsTimeScope: false, message: null, unsupported: false },
    parseNotes: [],
    error: message,
  }
}

function extractTarget(raw, lower) {
  const patterns = [
    /how many\s+([a-z][a-z\s-]{0,30}?)(?:\s+(?:should|can|will|to|at|on|for|between|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\?)|\?)/i,
    /how much\s+([a-z][a-z\s-]{0,30}?)(?:\s+(?:should|can|will|to|at|on|for|between|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\?)|\?)/i,
    /number of\s+([a-z][a-z\s-]{0,30}?)(?:\s+(?:at|on|for|tomorrow|today|\?)|\?)/i,
    /expect(?:ed)?\s+([a-z][a-z\s-]{2,30}?)(?:\s+(?:at|on|for|tomorrow|today|\?)|\?)/i,
  ]

  for (const re of patterns) {
    const m = raw.match(re)
    if (m) {
      const cleaned = cleanTargetPhrase(m[1])
      if (cleaned) {
        return { key: cleaned.key, label: cleaned.label }
      }
    }
  }

  if (/how many observations/i.test(raw) || /next period/i.test(lower)) {
    return { key: 'observations', label: 'Observations' }
  }

  if (/demand/i.test(lower)) {
    return { key: 'demand', label: 'Demand' }
  }

  return null
}

function cleanTargetPhrase(phrase) {
  const words = phrase
    .toLowerCase()
    .replace(/[?.!,]/g, '')
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))

  if (words.length === 0) return null

  const key = words.join('_')
  const label = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return { key, label }
}

function extractPlanningConfidence(lower) {
  for (const { re, value } of CONFIDENCE_PATTERNS) {
    if (re.test(lower)) return value
  }
  return null
}

function detectAmbiguity(lower, time, dateHint, day) {
  const hasDayContext = Boolean(day || dateHint)
  const hasTime = time.scope === 'point' || time.scope === 'range'

  if (hasDayContext && !hasTime && time.scope !== 'whole_day') {
    if (/\btomorrow\b|\btoday\b|\bmonday\b|\btuesday\b|\bwednesday\b|\bthursday\b|\bfriday\b|\bsaturday\b|\bsunday\b/.test(lower)) {
      return {
        needsTimeScope: true,
        message:
          'Your question mentions a day but not a specific time. Do you want an estimate for the entire day or a specific time?',
        unsupported: false,
      }
    }
  }

  return { needsTimeScope: false, message: null, unsupported: false }
}

function buildParseNotes(target, day, dateHint, time) {
  const notes = []
  if (target) notes.push(`Target: ${target.label}`)
  if (day) notes.push(`Day: ${day.label}`)
  if (dateHint) notes.push(`Date: ${dateHint.label}`)
  if (time.scope === 'point') notes.push(`Time: ${time.label}`)
  if (time.scope === 'range') notes.push(`Time window: ${time.label}`)
  if (time.scope === 'whole_day') notes.push('Scope: entire day')
  return notes
}

export const EXAMPLE_QUESTIONS = [
  'How many lunches should I prepare tomorrow?',
  'How many cars can I expect at 10 AM tomorrow?',
  'How many customers should I expect Friday at 6 PM?',
  'How many orders should I prepare for tomorrow?',
  'How many observations might I see in the next period?',
]

export const DEFAULT_QUESTION = EXAMPLE_QUESTIONS[4]
