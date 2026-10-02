import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseQuestion } from '../src/query/questionParser.js'
import { resolveQuery } from '../src/query/queryResolver.js'
import { parseCsv } from '../src/data/historicalData.js'
import { selectObservations } from '../src/data/dataSelector.js'

describe('questionParser', () => {
  it('parses target and time for car wash style question', () => {
    const p = parseQuestion('How many cars can I expect at 10 AM tomorrow?')
    assert.equal(p.target, 'cars')
    assert.equal(p.time.scope, 'point')
    assert.equal(p.dateHint, 'tomorrow')
    assert.ok(p.time.minutes != null)
  })

  it('detects ambiguity for tomorrow without time', () => {
    const p = parseQuestion('How many lunches should I prepare tomorrow?')
    assert.equal(p.target, 'lunches')
    assert.equal(p.ambiguity.needsTimeScope, true)
  })

  it('parses Friday and evening window', () => {
    const p = parseQuestion('How many customers should I expect Friday at 6 PM?')
    assert.equal(p.dayOfWeek, 5)
    assert.equal(p.time.scope, 'point')
  })
})

describe('resolveQuery simple mode', () => {
  it('uses all values for generic period question', () => {
    const r = resolveQuery({
      question: 'How many observations might I see in the next period?',
      dataMode: 'simple',
      simpleValues: [10, 11, 15, 10, 20],
      granularityMinutes: 60,
    })
    assert.equal(r.error, null)
    assert.deepEqual(r.values, [10, 11, 15, 10, 20])
  })

  it('rejects time-specific question with simple data', () => {
    const r = resolveQuery({
      question: 'How many cars at 10 AM tomorrow?',
      dataMode: 'simple',
      simpleValues: [5, 6, 7],
      granularityMinutes: 60,
    })
    assert.ok(r.error)
  })
})

describe('time-aware selection', () => {
  it('filters 10:00 observations', () => {
    const { records } = parseCsv(`date,time,value
2026-09-01,10:00,5
2026-09-01,11:00,7
2026-09-02,10:00,6
2026-09-02,11:00,8`)

    const parsed = parseQuestion('How many cars at 10 AM?')
    const sel = selectObservations(records, parsed, { granularityMinutes: 60 })
    assert.equal(sel.error, null)
    assert.deepEqual(sel.values, [5, 6])
  })
})
