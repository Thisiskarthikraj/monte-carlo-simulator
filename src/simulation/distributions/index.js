import { createNormalSampler, defaultsFromData as normalDefaults } from './normal.js'
import { createUniformSampler, defaultsFromData as uniformDefaults } from './uniform.js'
import { createTriangularSampler, defaultsFromData as triangularDefaults } from './triangular.js'
import { createEmpiricalSampler } from './empirical.js'

export const DISTRIBUTION_IDS = {
  EMPIRICAL: 'empirical',
  NORMAL: 'normal',
  UNIFORM: 'uniform',
  TRIANGULAR: 'triangular',
}

export const DISTRIBUTION_LABELS = {
  [DISTRIBUTION_IDS.EMPIRICAL]: 'Empirical / Historical',
  [DISTRIBUTION_IDS.NORMAL]: 'Normal',
  [DISTRIBUTION_IDS.UNIFORM]: 'Uniform',
  [DISTRIBUTION_IDS.TRIANGULAR]: 'Triangular',
}

export function getDefaultParams(distributionId, values) {
  switch (distributionId) {
    case DISTRIBUTION_IDS.NORMAL:
      return normalDefaults(values)
    case DISTRIBUTION_IDS.UNIFORM:
      return uniformDefaults(values)
    case DISTRIBUTION_IDS.TRIANGULAR:
      return triangularDefaults(values)
    case DISTRIBUTION_IDS.EMPIRICAL:
    default:
      return {}
  }
}

/**
 * @returns {{ sampler: () => number, error: string | null }}
 */
export function buildSampler(distributionId, values, params) {
  switch (distributionId) {
    case DISTRIBUTION_IDS.EMPIRICAL: {
      if (values.length < 1) {
        return { sampler: null, error: 'Empirical sampling needs at least one observation.' }
      }
      return { sampler: createEmpiricalSampler(values), error: null }
    }
    case DISTRIBUTION_IDS.NORMAL: {
      const mean = Number(params.mean)
      const stdDev = Number(params.stdDev)
      if (!Number.isFinite(mean)) {
        return { sampler: null, error: 'Enter a valid mean.' }
      }
      if (!Number.isFinite(stdDev) || stdDev <= 0) {
        return { sampler: null, error: 'Standard deviation must be greater than zero.' }
      }
      return { sampler: createNormalSampler(mean, stdDev), error: null }
    }
    case DISTRIBUTION_IDS.UNIFORM: {
      const min = Number(params.min)
      const max = Number(params.max)
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return { sampler: null, error: 'Enter valid min and max values.' }
      }
      if (max < min) {
        return { sampler: null, error: 'Max must be greater than or equal to min.' }
      }
      return { sampler: createUniformSampler(min, max), error: null }
    }
    case DISTRIBUTION_IDS.TRIANGULAR: {
      const min = Number(params.min)
      const max = Number(params.max)
      const mode = Number(params.mode)
      if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(mode)) {
        return { sampler: null, error: 'Enter valid min, max, and mode.' }
      }
      if (max < min) {
        return { sampler: null, error: 'Max must be greater than or equal to min.' }
      }
      if (mode < min || mode > max) {
        return { sampler: null, error: 'Mode must be between min and max.' }
      }
      return { sampler: createTriangularSampler(min, max, mode), error: null }
    }
    default:
      return { sampler: null, error: 'Unknown distribution.' }
  }
}
