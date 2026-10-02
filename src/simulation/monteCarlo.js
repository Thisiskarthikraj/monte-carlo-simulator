import { buildSampler } from './distributions/index.js'
import { computeSummary, buildHistogram, buildCdfPoints } from './statistics.js'

export const MIN_SIMULATIONS = 100
export const MAX_SIMULATIONS = 2_000_000
export const DEFAULT_SIMULATIONS = 100_000

export const SIMULATION_PRESETS = [1_000, 10_000, 100_000, 1_000_000]

export function validateSimulationCount(n) {
  const count = Math.floor(Number(n))
  if (!Number.isFinite(count)) {
    return { count: null, error: 'Enter a valid number of simulations.' }
  }
  if (count < MIN_SIMULATIONS) {
    return {
      count: null,
      error: `Use at least ${MIN_SIMULATIONS.toLocaleString()} simulations.`,
    }
  }
  if (count > MAX_SIMULATIONS) {
    return {
      count: null,
      error: `Maximum is ${MAX_SIMULATIONS.toLocaleString()} simulations to keep the browser responsive.`,
    }
  }
  return { count, error: null }
}

/**
 * Run simulation synchronously (for tests or small runs).
 */
export function runMonteCarlo({ sampler, count, onProgress }) {
  const samples = new Float64Array(count)
  const chunk = Math.max(1000, Math.floor(count / 100))
  for (let i = 0; i < count; i++) {
    samples[i] = sampler()
    if (onProgress && i > 0 && i % chunk === 0) {
      onProgress(i / count)
    }
  }
  if (onProgress) onProgress(1)

  const summary = computeSummary(samples)
  const histogram = buildHistogram(samples)
  const cdf = buildCdfPoints(summary.sorted)

  return {
    samples,
    summary,
    histogram,
    cdf,
  }
}

export function prepareRun({ distributionId, values, params, count }) {
  const { count: validCount, error: countError } = validateSimulationCount(count)
  if (countError) {
    return { error: countError }
  }

  const { sampler, error: samplerError } = buildSampler(distributionId, values, params)
  if (samplerError) {
    return { error: samplerError }
  }

  return { sampler, count: validCount, error: null }
}
