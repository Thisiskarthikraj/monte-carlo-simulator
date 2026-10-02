import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseHistoricalData } from '../src/simulation/parseData.js'
import { buildSampler, DISTRIBUTION_IDS } from '../src/simulation/distributions/index.js'
import { runMonteCarlo } from '../src/simulation/monteCarlo.js'
import {
  computeSummary,
  probabilityGe,
  probabilityLe,
  percentile,
} from '../src/simulation/statistics.js'

const EXAMPLE = [10, 11, 15, 10, 20]

describe('parseHistoricalData', () => {
  it('parses comma-separated values', () => {
    const { values, error } = parseHistoricalData('10, 11, 15, 10, 20')
    assert.equal(error, null)
    assert.deepEqual(values, EXAMPLE)
  })

  it('parses multiline values', () => {
    const { values, error } = parseHistoricalData('10\n11\n15\n10\n20')
    assert.equal(error, null)
    assert.deepEqual(values, EXAMPLE)
  })

  it('rejects non-numeric tokens', () => {
    const { error } = parseHistoricalData('10, foo')
    assert.ok(error)
  })
})

describe('empirical Monte Carlo — example dataset', () => {
  const n = 100_000
  const { sampler } = buildSampler(DISTRIBUTION_IDS.EMPIRICAL, EXAMPLE, {})
  const { samples, summary } = runMonteCarlo({ sampler, count: n })

  it('produces expected count', () => {
    assert.equal(summary.count, n)
  })

  it('mean is close to sample mean 13.2', () => {
    assert.ok(Math.abs(summary.mean - 13.2) < 0.15)
  })

  it('min and max stay within observed range', () => {
    assert.equal(summary.min, 10)
    assert.equal(summary.max, 20)
  })

  it('percentiles are internally consistent (monotonic)', () => {
    const p = summary.percentiles
    assert.ok(p[5] <= p[10])
    assert.ok(p[10] <= p[25])
    assert.ok(p[25] <= p[50])
    assert.ok(p[50] <= p[75])
    assert.ok(p[75] <= p[90])
    assert.ok(p[90] <= p[95])
  })

  it('P50 matches median from computeSummary', () => {
    assert.equal(summary.percentiles[50], summary.median)
  })

  it('probability queries match empirical counts', () => {
    const pGe20 = probabilityGe(samples, 20)
    const expected = EXAMPLE.filter((x) => x >= 20).length / EXAMPLE.length
    assert.ok(Math.abs(pGe20 - expected) < 0.02)

    const pLe10 = probabilityLe(samples, 10)
    const expectedLe = EXAMPLE.filter((x) => x <= 10).length / EXAMPLE.length
    assert.ok(Math.abs(pLe10 - expectedLe) < 0.02)
  })
})

describe('percentile', () => {
  it('interpolates correctly for small sorted array', () => {
    const sorted = [1, 2, 3, 4, 5]
    assert.equal(percentile(sorted, 0), 1)
    assert.equal(percentile(sorted, 100), 5)
    assert.equal(percentile(sorted, 50), 3)
  })
})

describe('normal sampler', () => {
  it('produces finite samples with valid params', () => {
    const { sampler } = buildSampler(DISTRIBUTION_IDS.NORMAL, EXAMPLE, {
      mean: 13.2,
      stdDev: 3.5,
    })
    const { summary } = runMonteCarlo({ sampler, count: 5000 })
    assert.ok(Number.isFinite(summary.mean))
    assert.ok(summary.stdDev > 0)
  })
})
