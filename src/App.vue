<script setup>
import { ref, computed, watch } from 'vue'
import QuestionInput from './components/QuestionInput.vue'
import DataInput from './components/DataInput.vue'
import PlanningConfidence from './components/PlanningConfidence.vue'
import ScopeClarification from './components/ScopeClarification.vue'
import ResultCard from './components/ResultCard.vue'
import StatisticalDetails from './components/StatisticalDetails.vue'
import { DEFAULT_QUESTION } from './query/questionParser.js'
import { resolveQuery } from './query/queryResolver.js'
import { parseTimeField } from './query/timeParser.js'
import {
  EXAMPLE_SIMPLE_DATA,
  parseSimpleData,
  parseCsv,
  validateRecordRow,
  normalizeRecords,
} from './data/historicalData.js'
import { DISTRIBUTION_IDS } from './simulation/distributions/index.js'
import { DEFAULT_SIMULATIONS, prepareRun } from './simulation/monteCarlo.js'
import { useSimulation } from './composables/useSimulation.js'
import { buildDecisionResult } from './decision/resultEngine.js'

const question = ref(DEFAULT_QUESTION)
const variableName = ref('Observations')
const dataMode = ref('simple')
const simpleText = ref(EXAMPLE_SIMPLE_DATA)
const tableRows = ref([])
const granularityMinutes = ref(60)
const csvError = ref(null)
const planningConfidence = ref(90)

const scopeChoice = ref('')
const scopeTime = ref('12:00')

const distributionId = ref(DISTRIBUTION_IDS.EMPIRICAL)
const params = ref({})
const simulationCount = ref(DEFAULT_SIMULATIONS)

const resolved = ref(null)
const analysisError = ref(null)
const needsScope = ref(false)
const detailsOpen = ref(false)

const {
  running,
  progress,
  error: simError,
  summary,
  histogram,
  cdf,
  samples,
  run,
} = useSimulation()

const simpleValues = computed(() => parseSimpleData(simpleText.value).values)

const timeAwareRecords = computed(() => {
  const records = []
  for (const row of tableRows.value) {
    if (!row.date?.trim() && !row.time?.trim() && (row.value === '' || row.value == null)) continue
    const built = validateRecordRow(row, granularityMinutes.value)
    if (built.record) records.push(built.record)
  }
  return normalizeRecords(records, granularityMinutes.value)
})

const effectiveVariableName = computed(() => {
  const manual = variableName.value?.trim()
  if (manual) return manual
  return resolved.value?.parsed?.targetLabel ?? 'Quantity'
})

const effectivePlanning = computed(() => {
  return resolved.value?.parsed?.planningConfidence ?? planningConfidence.value
})

watch(
  () => resolved.value?.parsed?.planningConfidence,
  (p) => {
    if (p != null) planningConfidence.value = p
  },
)

const decision = computed(() => {
  if (!summary.value || !resolved.value) return null
  return buildDecisionResult({
    summary: summary.value,
    samples: samples.value,
    planningConfidence: effectivePlanning.value,
    variableName: effectiveVariableName.value,
    parsedQuestion: resolved.value.parsed,
    selectionMeta: resolved.value.meta,
    distributionId: distributionId.value,
    simulationCount: simulationCount.value,
  })
})

function buildResolveInput(scopeOverride = null, scopeTimeMinutes = null) {
  return {
    question: question.value,
    dataMode: dataMode.value,
    simpleValues: simpleValues.value,
    records: timeAwareRecords.value,
    granularityMinutes: granularityMinutes.value,
    scopeOverride,
    scopeTimeMinutes,
  }
}

function resolve(scopeOverride = null, scopeTimeMinutes = null) {
  analysisError.value = null
  needsScope.value = false

  if (dataMode.value === 'simple') {
    const p = parseSimpleData(simpleText.value)
    if (p.error) {
      analysisError.value = p.error
      return null
    }
  } else if (timeAwareRecords.value.length === 0) {
    analysisError.value = 'Add at least one complete time-aware row or upload CSV.'
    return null
  }

  const result = resolveQuery(buildResolveInput(scopeOverride, scopeTimeMinutes))

  if (result.needsScopeClarification) {
    needsScope.value = true
    resolved.value = { parsed: result.parsed, meta: null }
    return null
  }

  if (result.error) {
    analysisError.value = result.error
    resolved.value = result.parsed ? { parsed: result.parsed, meta: null } : null
    return null
  }

  resolved.value = {
    parsed: result.parsed,
    meta: result.meta,
    values: result.values,
  }
  return result.values
}

function executeSimulation(values) {
  const prep = prepareRun({
    distributionId: distributionId.value,
    values,
    params: params.value,
    count: simulationCount.value,
  })
  if (prep.error) {
    analysisError.value = prep.error
    return
  }
  run({
    distributionId: distributionId.value,
    values,
    params: { ...params.value },
    count: simulationCount.value,
  })
}

function onAnalyze() {
  scopeChoice.value = ''
  const values = resolve()
  if (values) executeSimulation(values)
}

function onScopeConfirm() {
  if (!scopeChoice.value) {
    analysisError.value = 'Choose entire day or a specific time.'
    return
  }
  let scopeTimeMinutes = null
  if (scopeChoice.value === 'point') {
    const t = parseTimeField(scopeTime.value)
    if (t.error) {
      analysisError.value = t.error
      return
    }
    scopeTimeMinutes = t.minutes
  }
  const values = resolve(scopeChoice.value, scopeTimeMinutes)
  needsScope.value = false
  if (values) executeSimulation(values)
}

function onRerun() {
  const values = resolved.value?.values
  if (!values?.length) return
  executeSimulation(values)
}

function onImportCsv(text) {
  csvError.value = null
  const { records, error } = parseCsv(text)
  if (error) {
    csvError.value = error
    return
  }
  tableRows.value = records.map((r) => ({
    date: r.date,
    time: r.time,
    value: String(r.value),
  }))
  dataMode.value = 'timeaware'
}

const showResult = computed(() => Boolean(decision.value && !running.value))
const flowError = computed(() => analysisError.value || simError.value)
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Monte Carlo Simulator</h1>
      <p class="subtitle">Explore uncertainty through simulation.</p>
      <p class="intro">Ask a question about what you want to estimate.</p>
    </header>

    <main class="main">
      <section class="card flow-card">
        <QuestionInput v-model="question" :disabled="running" />

        <DataInput
          v-model:data-mode="dataMode"
          v-model:simple-text="simpleText"
          v-model:table-rows="tableRows"
          v-model:granularity-minutes="granularityMinutes"
          v-model:variable-name="variableName"
          :csv-error="csvError"
          @import-csv="onImportCsv"
        />

        <PlanningConfidence v-model="planningConfidence" />

        <ScopeClarification
          v-if="needsScope"
          v-model:scope-choice="scopeChoice"
          v-model:time-value="scopeTime"
          :message="resolved?.parsed?.ambiguity?.message ?? 'Clarify the time scope for your estimate.'"
        />

        <div class="analyze-row">
          <button
            v-if="needsScope"
            type="button"
            class="btn-primary"
            :disabled="running"
            @click="onScopeConfirm"
          >
            Continue &amp; simulate
          </button>
          <button
            v-else
            type="button"
            class="btn-primary analyze-btn"
            :disabled="running"
            @click="onAnalyze"
          >
            <span v-if="running">Analyzing… {{ Math.round(progress * 100) }}%</span>
            <span v-else>Analyze &amp; simulate</span>
          </button>
          <div v-if="running" class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress * 100}%` }" />
          </div>
        </div>

        <p v-if="flowError" class="field-error" role="alert">{{ flowError }}</p>

        <p class="privacy">Your data stays in this browser. Simulations run locally on your device.</p>
      </section>

      <div v-if="resolved?.parsed?.parseNotes?.length" class="parsed-hint card">
        <span class="parsed-label">Interpreted as</span>
        <ul>
          <li v-for="(note, i) in resolved.parsed.parseNotes" :key="i">{{ note }}</li>
        </ul>
      </div>

      <ResultCard :decision="decision" :running="running" />

      <StatisticalDetails
        v-if="showResult"
        v-model:open="detailsOpen"
        v-model:distribution-id="distributionId"
        v-model:params="params"
        v-model:simulation-count="simulationCount"
        :summary="summary"
        :histogram="histogram"
        :cdf="cdf"
        :samples="samples"
        :selection-meta="resolved?.meta"
        :values="resolved?.values ?? []"
        :running="running"
        :progress="progress"
        @rerun="onRerun"
      />
    </main>

    <footer class="footer">
      <p>Question → analyze → practical answer. Expand simulation details for the full statistical view.</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.header h1 {
  font-size: clamp(1.75rem, 4vw, 2.125rem);
  margin: 0;
}

.subtitle {
  margin: 0.4rem 0 0;
  color: var(--text-muted);
}

.intro {
  margin: 0.75rem 0 0;
  font-size: 1rem;
  color: var(--text);
  font-weight: 500;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.flow-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.analyze-row {
  margin-top: 0.25rem;
}

.analyze-btn {
  width: 100%;
}

.progress-bar {
  margin-top: 0.75rem;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.15s ease-out;
}

.privacy {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.parsed-hint {
  padding: 0.875rem 1rem;
}

.parsed-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.parsed-hint ul {
  margin: 0.35rem 0 0;
  padding-left: 1.2rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.footer p {
  margin: 0;
}
</style>
