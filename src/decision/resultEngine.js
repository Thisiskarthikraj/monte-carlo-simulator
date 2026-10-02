import { percentile, smartFormat, formatPercent } from '../simulation/statistics.js'
import { DISTRIBUTION_LABELS } from '../simulation/distributions/index.js'

/**
 * Build user-facing planning answer from simulation output.
 */
export function buildDecisionResult({
  summary,
  samples,
  planningConfidence,
  variableName,
  parsedQuestion,
  selectionMeta,
  distributionId,
  simulationCount,
}) {
  const spread = summary.max - summary.min
  const unit = variableName?.trim() || parsedQuestion?.targetLabel || 'units'
  const unitLower = unit.toLowerCase()

  const sorted = samples ? sortSamples(samples) : null
  const planningValue = sorted
    ? percentile(sorted, planningConfidence)
    : summary.percentiles[planningConfidence] ?? summary.percentiles[90]

  const expected = summary.mean
  const median = summary.median

  const timePhrase = buildTimePhrase(parsedQuestion)
  const headline = buildHeadline({ expected, unit, timePhrase, median })

  const planningExplanation = `Using the selected historical data and simulation model, ${smartFormat(planningValue, spread)} ${unitLower} corresponds to approximately the ${planningConfidence}th percentile (planning confidence).`

  const planningAction = `If you want to plan for approximately ${planningConfidence}% of simulated demand, prepare for around ${smartFormat(Math.ceil(planningValue), spread)} ${unitLower}.`

  return {
    headline,
    subheadline: timePhrase,
    expected,
    median,
    planningConfidence,
    planningValue,
    planningPercentileLabel: `P${planningConfidence}`,
    planningExplanation,
    planningAction,
    unit,
    whyBullets: buildWhyBullets({
      selectionMeta,
      distributionId,
      simulationCount,
      planningConfidence,
    }),
    metrics: {
      expected: smartFormat(expected, spread),
      median: smartFormat(median, spread),
      planningValue: smartFormat(planningValue, spread),
      planningRounded: smartFormat(Math.ceil(planningValue), spread),
      min: smartFormat(summary.min, spread),
      max: smartFormat(summary.max, spread),
      stdDev: smartFormat(summary.stdDev, spread),
    },
    distributionLabel: DISTRIBUTION_LABELS[distributionId] ?? distributionId,
  }
}

function sortSamples(samples) {
  const arr = new Float64Array(samples.length)
  for (let i = 0; i < samples.length; i++) arr[i] = samples[i]
  arr.sort()
  return arr
}

function buildTimePhrase(parsed) {
  if (!parsed) return ''
  const parts = []
  if (parsed.dateLabel) parts.push(parsed.dateLabel)
  else if (parsed.dayLabel) parts.push(parsed.dayLabel)
  if (parsed.time.scope === 'point' && parsed.time.label) parts.push(`at ${parsed.time.label}`)
  if (parsed.time.scope === 'range' && parsed.time.label) parts.push(`(${parsed.time.label})`)
  if (parsed.time.scope === 'whole_day') parts.push('for the full day')
  return parts.join(' ')
}

function buildHeadline({ expected, unit, timePhrase, median }) {
  const approx = smartFormat(expected)
  const unitLower = unit.toLowerCase()
  if (timePhrase) {
    return `About ${approx} ${unitLower} expected ${timePhrase}.`
  }
  return `Expected demand is around ${approx} ${unitLower} (median ${smartFormat(median)}).`
}

function buildWhyBullets({ selectionMeta, distributionId, simulationCount, planningConfidence }) {
  const bullets = []
  if (selectionMeta?.filterDescription) {
    bullets.push(`Historical filter: ${selectionMeta.filterDescription}`)
  }
  if (selectionMeta?.fallback?.applied) {
    bullets.push(`Note: ${selectionMeta.fallback.reason}`)
  }
  bullets.push(`Distribution: ${DISTRIBUTION_LABELS[distributionId] ?? distributionId}`)
  bullets.push(`${simulationCount.toLocaleString()} simulations`)
  bullets.push(`${planningConfidence}% planning confidence`)
  return bullets
}

export { formatPercent, smartFormat }
