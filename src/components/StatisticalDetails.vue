<script setup>
import DistributionSelector from './DistributionSelector.vue'
import PercentileTable from './PercentileTable.vue'
import Histogram from './Histogram.vue'
import CumulativeDistribution from './CumulativeDistribution.vue'
import ProbabilityCalculator from './ProbabilityCalculator.vue'
import { SIMULATION_PRESETS, DEFAULT_SIMULATIONS } from '../simulation/monteCarlo.js'

const open = defineModel('open', { type: Boolean, default: false })
const distributionId = defineModel('distributionId', { type: String, required: true })
const params = defineModel('params', { type: Object, required: true })
const simulationCount = defineModel('simulationCount', { type: Number, default: DEFAULT_SIMULATIONS })

defineProps({
  summary: { type: Object, default: null },
  histogram: { type: Object, default: null },
  cdf: { type: Array, default: () => [] },
  samples: { type: Object, default: null },
  selectionMeta: { type: Object, default: null },
  values: { type: Array, default: () => [] },
  running: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
})

const emit = defineEmits(['rerun'])
</script>

<template>
  <details class="stat-details" :open="open" @toggle="open = $event.target.open">
    <summary>Simulation details</summary>
    <div v-if="summary" class="details-body">
      <p class="field-hint">
        Technical view for people who want distributions, percentiles, and charts. Re-run after
        changing settings.
      </p>

      <div v-if="selectionMeta" class="meta-box">
        <p><strong>Historical filter:</strong> {{ selectionMeta.filterDescription }}</p>
        <p v-if="selectionMeta.fallback?.applied" class="fallback">
          {{ selectionMeta.fallback.reason }}
        </p>
        <p>
          <strong>Observations used:</strong> {{ selectionMeta.observationCount }}
        </p>
      </div>

      <div class="rerun-panel">
        <label class="field-label">Simulations</label>
        <div class="chip-row">
          <button
            v-for="preset in SIMULATION_PRESETS"
            :key="preset"
            type="button"
            class="btn-secondary"
            @click="simulationCount = preset"
          >
            {{ preset.toLocaleString() }}
          </button>
        </div>
        <input v-model.number="simulationCount" type="number" min="100" step="1000" />

        <DistributionSelector
          v-model:distribution-id="distributionId"
          v-model:params="params"
          :values="values"
        />

        <button type="button" class="btn-primary rerun-btn" :disabled="running" @click="emit('rerun')">
          <span v-if="running">Re-running… {{ Math.round(progress * 100) }}%</span>
          <span v-else>Re-run simulation</span>
        </button>
      </div>

      <div class="card inner">
        <h3 class="card-title">Percentiles</h3>
        <PercentileTable :summary="summary" />
      </div>

      <div class="card inner">
        <h3 class="card-title">Histogram</h3>
        <Histogram :histogram="histogram" />
      </div>

      <div class="card inner">
        <h3 class="card-title">Cumulative distribution</h3>
        <CumulativeDistribution :cdf="cdf" />
      </div>

      <div class="card inner">
        <h3 class="card-title">Probability calculator</h3>
        <p class="field-hint">Advanced: e.g. P(X ≥ 10) from simulation results.</p>
        <ProbabilityCalculator :samples="samples" />
      </div>
    </div>
  </details>
</template>

<style scoped>
.stat-details {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 0.75rem 1rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}

summary::before {
  content: '▸';
  display: inline-block;
  margin-right: 0.5rem;
  color: var(--text-muted);
}

details[open] summary::before {
  transform: rotate(90deg);
}

.details-body {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-box {
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

.meta-box p {
  margin: 0 0 0.35rem;
}

.fallback {
  color: #9a6b2f;
}

.rerun-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rerun-btn {
  width: fit-content;
}

.inner {
  box-shadow: none;
}

.inner .card-title {
  margin-bottom: 0.75rem;
}
</style>
