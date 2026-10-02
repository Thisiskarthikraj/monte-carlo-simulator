/**
 * Sample with replacement from observed values (bootstrap / empirical).
 */
export function createEmpiricalSampler(values) {
  const data = values.slice()
  const n = data.length
  return () => data[Math.floor(Math.random() * n)]
}
