export function defaultsFromData(values) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  return { min, max }
}

/**
 * Continuous uniform on [min, max]. If min === max, returns constant.
 */
export function createUniformSampler(min, max) {
  if (max < min) {
    ;[min, max] = [max, min]
  }
  const span = max - min
  if (span === 0) {
    return () => min
  }
  return () => min + Math.random() * span
}
