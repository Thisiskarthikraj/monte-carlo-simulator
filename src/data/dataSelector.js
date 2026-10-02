import { formatMinutes, snapToGranularity } from '../query/timeParser.js'
import { DAY_LABELS } from '../query/dateParser.js'

const MIN_OBSERVATIONS = 1
const PREFERRED_OBSERVATIONS = 3

/**
 * @param {import('./historicalData.js').HistoricalRecord[]} records
 * @param {import('../query/questionParser.types.js').ParsedQuestion} query
 * @param {{ granularityMinutes: number }} options
 */
export function selectObservations(records, query, options) {
  const { granularityMinutes } = options
  let pool = records.map((r) => ({
    ...r,
    minutes: snapToGranularity(r.minutes, granularityMinutes),
  }))

  const filters = []

  if (query.dayOfWeek != null) {
    const dayFiltered = pool.filter((r) => r.dayOfWeek === query.dayOfWeek)
    if (dayFiltered.length >= MIN_OBSERVATIONS) {
      pool = dayFiltered
      filters.push(`${DAY_LABELS[query.dayOfWeek]} observations`)
    } else if (dayFiltered.length > 0) {
      return {
        values: [],
        usedRecords: dayFiltered,
        filterDescription: '',
        fallback: null,
        error: `Only ${dayFiltered.length} ${DAY_LABELS[query.dayOfWeek]} observation(s) found. Add more ${DAY_LABELS[query.dayOfWeek]} data or broaden the question.`,
      }
    } else {
      filters.push(`${DAY_LABELS[query.dayOfWeek]} (none found)`)
    }
  }

  let fallback = null
  if (query.dayOfWeek != null && pool.length === records.length) {
    fallback = {
      applied: true,
      reason: `No historical rows matched ${DAY_LABELS[query.dayOfWeek]}. Using all ${records.length} observations instead.`,
    }
  }

  const time = query.time

  if (time.scope === 'point' && time.minutes != null) {
    const target = snapToGranularity(time.minutes, granularityMinutes)
    const matched = pool.filter((r) => r.minutes === target)
    if (matched.length >= MIN_OBSERVATIONS) {
      pool = matched
      filters.push(`time ${formatMinutes(target)}`)
    } else {
      const near = pool.filter((r) => Math.abs(r.minutes - target) <= granularityMinutes)
      if (near.length >= MIN_OBSERVATIONS) {
        pool = near
        filters.push(`around ${formatMinutes(target)}`)
      } else if (matched.length > 0) {
        pool = matched
        filters.push(`time ${formatMinutes(target)} (limited data)`)
      } else {
        return {
          values: [],
          usedRecords: [],
          filterDescription: '',
          fallback,
          error: `No historical observations near ${formatMinutes(target)}. Add data for that time or adjust the question.`,
        }
      }
    }
  } else if (time.scope === 'range' && time.startMinutes != null && time.endMinutes != null) {
    let start = time.startMinutes
    let end = time.endMinutes
    if (end < start) [start, end] = [end, start]

    const inRange = pool.filter((r) => r.minutes >= start && r.minutes <= end)
    if (inRange.length === 0) {
      return {
        values: [],
        usedRecords: [],
        filterDescription: '',
        fallback,
        error: `No observations between ${formatMinutes(start)} and ${formatMinutes(end)}.`,
      }
    }

    const byDate = groupByDate(inRange)
    const values = []
    const usedRecords = []
    for (const [, rows] of byDate) {
      const sum = rows.reduce((s, r) => s + r.value, 0)
      values.push(sum)
      usedRecords.push(...rows)
    }

    const desc = [
      filters.join(', '),
      `window ${formatMinutes(start)} – ${formatMinutes(end)} (daily totals)`,
    ]
      .filter(Boolean)
      .join('; ')

    return wrapResult(values, usedRecords, desc, fallback, query)
  } else if (time.scope === 'whole_day') {
    const byDate = groupByDate(pool)
    const values = []
    const usedRecords = []
    for (const [, rows] of byDate) {
      const sum = rows.reduce((s, r) => s + r.value, 0)
      values.push(sum)
      usedRecords.push(...rows)
    }
    if (values.length === 0) {
      return {
        values: [],
        usedRecords: [],
        filterDescription: '',
        fallback,
        error: 'No daily totals could be computed from your data.',
      }
    }
    const desc = [filters.join(', '), 'full-day totals per date'].filter(Boolean).join('; ')
    return wrapResult(values, usedRecords, desc, fallback, query)
  }

  const values = pool.map((r) => r.value)
  if (values.length < MIN_OBSERVATIONS) {
    return {
      values: [],
      usedRecords: [],
      filterDescription: '',
      fallback,
      error: 'Not enough matching historical observations.',
    }
  }

  const desc = filters.length ? filters.join(', ') : 'all time-aware observations'
  return wrapResult(values, pool, desc, fallback, query)
}

function groupByDate(rows) {
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.date)) map.set(r.date, [])
    map.get(r.date).push(r)
  }
  return map
}

function wrapResult(values, usedRecords, filterDescription, fallback, query) {
  if (values.length < PREFERRED_OBSERVATIONS) {
    fallback = fallback ?? {
      applied: true,
      reason: `Only ${values.length} matching observation(s). Results may be unstable—add more history if you can.`,
    }
  }

  let desc = filterDescription
  if (query.time.scope === 'unspecified' && query.dayOfWeek == null) {
    desc = `All ${values.length} historical values matching your question context.`
  }

  return {
    values,
    usedRecords,
    filterDescription: desc,
    fallback,
    error: null,
  }
}
