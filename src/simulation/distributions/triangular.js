export function defaultsFromData(values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  let mode = mean
  if (mode < min) mode = min
  if (mode > max) mode = max
  return { min, max, mode }
}

/**
 * Triangular distribution with min <= mode <= max.
 */
export function createTriangularSampler(min, max, mode) {
  if (max < min) {
    ;[min, max] = [max, min]
  }
  let m = mode
  if (m < min) m = min
  if (m > max) m = max

  const span = max - min
  if (span === 0) {
    return () => min
  }

  const fc = (m - min) / span

  return () => {
    const u = Math.random()
    if (u < fc) {
      return min + Math.sqrt(u * span * (m - min))
    }
    return max - Math.sqrt((1 - u) * span * (max - m))
  }
}
