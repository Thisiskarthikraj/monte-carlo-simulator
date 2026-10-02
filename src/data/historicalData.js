import { parseDateField, inferDayIndexFromDateString } from '../query/dateParser.js'
import { parseTimeField, snapToGranularity, minutesToTimeString } from '../query/timeParser.js'

export const EXAMPLE_SIMPLE_DATA = '10, 11, 15, 10, 20'

export const EXAMPLE_TIME_CSV = `date,time,value
2026-09-01,10:00,5
2026-09-01,11:00,7
2026-09-02,10:00,6
2026-09-02,11:00,8
2026-09-03,10:00,4
2026-09-03,11:00,6`

export const GRANULARITY_OPTIONS = [
  { minutes: 60, label: 'Hourly (60 min)' },
  { minutes: 30, label: 'Every 30 minutes' },
  { minutes: 15, label: 'Every 15 minutes' },
]

/**
 * @typedef {Object} HistoricalRecord
 * @property {string} date YYYY-MM-DD
 * @property {string} time HH:MM
 * @property {number} minutes
 * @property {number} value
 * @property {number} dayOfWeek 0–6
 */

/**
 * Parse comma / newline separated simple values.
 */
export function parseSimpleData(raw) {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { values: [], error: 'Enter at least one numeric value.' }
  }

  const tokens = trimmed.split(/[\s,;]+/).filter(Boolean)
  const values = []
  const invalid = []

  for (const token of tokens) {
    const n = Number(token)
    if (!Number.isFinite(n)) invalid.push(token)
    else values.push(n)
  }

  if (invalid.length > 0) {
    return {
      values: [],
      error: `Could not parse: ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}.`,
    }
  }

  if (values.length < 1) {
    return { values: [], error: 'Enter at least one numeric value.' }
  }

  return { values, error: null }
}

/** @deprecated alias */
export function parseHistoricalData(raw) {
  return parseSimpleData(raw)
}

/**
 * Parse CSV with header date,time,value (flexible column order).
 */
export function parseCsv(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return { records: [], error: 'CSV needs a header row and at least one data row.' }
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const dateIdx = header.indexOf('date')
  const timeIdx = header.indexOf('time')
  const valueIdx = header.indexOf('value')

  if (dateIdx === -1 || timeIdx === -1 || valueIdx === -1) {
    return {
      records: [],
      error: 'CSV header must include columns: date, time, value',
    }
  }

  const records = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim())
    if (parts.length < 3) {
      return { records: [], error: `Line ${i + 1}: expected three columns.` }
    }

    const row = buildRecord(parts[dateIdx], parts[timeIdx], parts[valueIdx], i + 1)
    if (row.error) return { records: [], error: row.error }
    records.push(row.record)
  }

  return { records, error: null }
}

export function buildRecord(dateStr, timeStr, valueStr, lineNum) {
  const dateParsed = parseDateField(dateStr)
  if (dateParsed.error) {
    return { error: `Line ${lineNum}: ${dateParsed.error}` }
  }

  const timeParsed = parseTimeField(timeStr)
  if (timeParsed.error) {
    return { error: `Line ${lineNum}: ${timeParsed.error}` }
  }

  const value = Number(valueStr)
  if (!Number.isFinite(value)) {
    return { error: `Line ${lineNum}: value must be a number.` }
  }

  /** @type {HistoricalRecord} */
  const record = {
    date: dateStr,
    time: minutesToTimeString(timeParsed.minutes),
    minutes: timeParsed.minutes,
    value,
    dayOfWeek: dateParsed.dayIndex,
  }

  return { record, error: null }
}

export function normalizeRecords(records, granularityMinutes) {
  return records.map((r) => ({
    ...r,
    minutes: snapToGranularity(r.minutes, granularityMinutes),
    time: minutesToTimeString(snapToGranularity(r.minutes, granularityMinutes)),
  }))
}

export function recordsToCsv(records) {
  const header = 'date,time,value'
  const rows = records.map((r) => `${r.date},${r.time},${r.value}`)
  return [header, ...rows].join('\n')
}

export function createEmptyRecord() {
  return { date: '', time: '', value: '' }
}

export function validateRecordRow(row, granularityMinutes) {
  const built = buildRecord(row.date, row.time, row.value, 0)
  if (built.error) return { record: null, error: built.error }
  const [normalized] = normalizeRecords([built.record], granularityMinutes)
  return { record: normalized, error: null }
}

export function inferDayFromRecordDate(dateStr) {
  return inferDayIndexFromDateString(dateStr)
}
