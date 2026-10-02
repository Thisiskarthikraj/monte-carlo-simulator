import { parseQuestion } from './questionParser.js'
import { selectObservations } from '../data/dataSelector.js'

/**
 * Resolve question + data into simulation-ready values and metadata.
 * @param {object} input
 * @param {string} input.question
 * @param {'simple' | 'timeaware'} input.dataMode
 * @param {number[]} [input.simpleValues]
 * @param {import('../data/historicalData.js').HistoricalRecord[]} [input.records]
 * @param {number} input.granularityMinutes
 * @param {'whole_day' | 'point' | null} [input.scopeOverride] user disambiguation
 * @param {number | null} [input.scopeTimeMinutes] when user picks specific time after ambiguity
 */
export function resolveQuery(input) {
  const parsed = parseQuestion(input.question)
  if (parsed.error) {
    return { parsed, error: parsed.error, values: null, meta: null }
  }

  if (!parsed.target && !parsed.raw.toLowerCase().includes('observation')) {
    return {
      parsed,
      error:
        'We could not identify what you are estimating. Try starting with "How many …" or name your variable below.',
      values: null,
      meta: null,
    }
  }

  let effectiveParsed = { ...parsed, time: { ...parsed.time } }

  if (parsed.ambiguity.needsTimeScope && input.scopeOverride) {
    if (input.scopeOverride === 'whole_day') {
      effectiveParsed.time = { scope: 'whole_day', label: 'full day' }
      effectiveParsed.ambiguity = { needsTimeScope: false, message: null, unsupported: false }
    } else if (input.scopeOverride === 'point' && input.scopeTimeMinutes != null) {
      effectiveParsed.time = {
        scope: 'point',
        minutes: input.scopeTimeMinutes,
        label: null,
      }
      effectiveParsed.ambiguity = { needsTimeScope: false, message: null, unsupported: false }
    }
  }

  if (effectiveParsed.ambiguity.needsTimeScope) {
    return {
      parsed: effectiveParsed,
      error: null,
      values: null,
      meta: null,
      needsScopeClarification: true,
    }
  }

  if (input.dataMode === 'simple') {
    const values = input.simpleValues ?? []
    if (values.length === 0) {
      return { parsed: effectiveParsed, error: 'Add historical values to simulate.', values: null, meta: null }
    }

    const timeSpecific =
      effectiveParsed.time.scope === 'point' ||
      effectiveParsed.time.scope === 'range' ||
      effectiveParsed.dayOfWeek != null

    if (timeSpecific) {
      return {
        parsed: effectiveParsed,
        error:
          'Your question mentions a day or time, but your data has no dates or times. Switch to time-aware data or simplify the question.',
        values: null,
        meta: null,
      }
    }

    return {
      parsed: effectiveParsed,
      error: null,
      values,
      meta: {
        filterDescription: `All ${values.length} historical values (simple data mode).`,
        fallback: null,
        observationCount: values.length,
        recordsUsed: values.length,
      },
      needsScopeClarification: false,
    }
  }

  const records = input.records ?? []
  if (records.length === 0) {
    return {
      parsed: effectiveParsed,
      error: 'Add time-aware historical data or upload a CSV.',
      values: null,
      meta: null,
    }
  }

  const selection = selectObservations(records, effectiveParsed, {
    granularityMinutes: input.granularityMinutes,
  })

  if (selection.error) {
    return { parsed: effectiveParsed, error: selection.error, values: null, meta: null }
  }

  return {
    parsed: effectiveParsed,
    error: null,
    values: selection.values,
    meta: {
      filterDescription: selection.filterDescription,
      fallback: selection.fallback,
      observationCount: selection.values.length,
      recordsUsed: selection.usedRecords.length,
      usedRecords: selection.usedRecords,
    },
    needsScopeClarification: false,
  }
}

export { parseQuestion }
