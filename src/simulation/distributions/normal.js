/** Box-Muller transform for standard normal samples */
function standardNormal() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/**
 * @param {number} mean
 * @param {number} stdDev must be > 0
 */
export function createNormalSampler(mean, stdDev) {
  const sd = stdDev > 0 ? stdDev : 1e-9
  return () => mean + standardNormal() * sd
}

export function defaultsFromData(values) {
  const n = values.length
  const mean = values.reduce((a, b) => a + b, 0) / n
  let variance = 0
  if (n > 1) {
    variance = values.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1)
  }
  const stdDev = Math.sqrt(variance) || 0
  return { mean, stdDev }
}
