const PERCENTILE_LEVELS = [5, 10, 25, 50, 75, 90, 95]

/**
 * Linear interpolation percentile (Type 7-ish, common in software).
 */
export function percentile(sorted, p) {
  if (sorted.length === 0) return NaN
  if (sorted.length === 1) return sorted[0]
  const rank = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(rank)
  const hi = Math.ceil(rank)
  if (lo === hi) return sorted[lo]
  const w = rank - lo
  return sorted[lo] * (1 - w) + sorted[hi] * w
}

export function computeSummary(samples) {
  const n = samples.length
  if (n === 0) {
    return null
  }

  let sum = 0
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < n; i++) {
    const x = samples[i]
    sum += x
    if (x < min) min = x
    if (x > max) max = x
  }
  const mean = sum / n

  const sorted = samples.slice().sort((a, b) => a - b)
  const median = percentile(sorted, 50)

  let variance = 0
  if (n > 1) {
    for (let i = 0; i < n; i++) {
      const d = samples[i] - mean
      variance += d * d
    }
    variance /= n - 1
  }
  const stdDev = Math.sqrt(variance)

  const percentiles = {}
  for (const level of PERCENTILE_LEVELS) {
    percentiles[level] = percentile(sorted, level)
  }

  return {
    count: n,
    mean,
    median,
    stdDev,
    min,
    max,
    percentiles,
    sorted,
  }
}

export function probabilityLe(samples, threshold) {
  if (samples.length === 0) return NaN
  let count = 0
  for (let i = 0; i < samples.length; i++) {
    if (samples[i] <= threshold) count++
  }
  return count / samples.length
}

export function probabilityGe(samples, threshold) {
  if (samples.length === 0) return NaN
  let count = 0
  for (let i = 0; i < samples.length; i++) {
    if (samples[i] >= threshold) count++
  }
  return count / samples.length
}

export function probabilityBetween(samples, a, b) {
  if (samples.length === 0) return NaN
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  let count = 0
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i]
    if (x >= lo && x <= hi) count++
  }
  return count / samples.length
}

/**
 * Histogram bins for charting (fixed bin count).
 */
export function buildHistogram(samples, binCount = 40) {
  if (samples.length === 0) {
    return { bins: [], binWidth: 0, min: 0, max: 0 }
  }

  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i]
    if (x < min) min = x
    if (x > max) max = x
  }

  if (min === max) {
    return {
      bins: [{ start: min, end: max, count: samples.length, label: formatBinLabel(min, max) }],
      binWidth: 0,
      min,
      max,
    }
  }

  const bins = Array.from({ length: binCount }, (_, i) => ({
    start: min + (i * (max - min)) / binCount,
    end: min + ((i + 1) * (max - min)) / binCount,
    count: 0,
  }))

  for (let i = 0; i < samples.length; i++) {
    const x = samples[i]
    let idx = Math.floor(((x - min) / (max - min)) * binCount)
    if (idx >= binCount) idx = binCount - 1
    if (idx < 0) idx = 0
    bins[idx].count++
  }

  for (const b of bins) {
    b.label = formatBinLabel(b.start, b.end)
  }

  return { bins, binWidth: (max - min) / binCount, min, max }
}

function formatBinLabel(start, end) {
  return `${smartFormat(start)} – ${smartFormat(end)}`
}

/**
 * CDF points for line chart (downsampled sorted unique steps).
 */
export function buildCdfPoints(sorted, maxPoints = 200) {
  if (sorted.length === 0) return []
  const n = sorted.length
  if (n <= maxPoints) {
    return sorted.map((x, i) => ({ x, y: (i + 1) / n }))
  }
  const step = Math.ceil(n / maxPoints)
  const points = []
  for (let i = 0; i < n; i += step) {
    points.push({ x: sorted[i], y: (i + 1) / n })
  }
  const last = sorted[n - 1]
  if (points[points.length - 1].x !== last) {
    points.push({ x: last, y: 1 })
  }
  return points
}

/**
 * Format numbers with sensible precision based on magnitude and spread.
 */
export function smartFormat(value, referenceSpread) {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  let decimals = 2
  if (referenceSpread !== undefined && referenceSpread > 0) {
    if (referenceSpread >= 100) decimals = 0
    else if (referenceSpread >= 10) decimals = 1
    else if (referenceSpread >= 1) decimals = 2
    else decimals = 3
  } else {
    if (abs >= 1000) decimals = 0
    else if (abs >= 100) decimals = 1
    else if (abs >= 1) decimals = 2
    else decimals = 4
  }
  const rounded = Number(value.toFixed(decimals))
  return rounded.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  })
}

export function formatPercent(probability) {
  if (!Number.isFinite(probability)) return '—'
  return `${(probability * 100).toFixed(1)}%`
}

export { PERCENTILE_LEVELS }
