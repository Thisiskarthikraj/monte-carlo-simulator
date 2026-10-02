<script setup>
import { computed } from 'vue'
import { smartFormat } from '../simulation/statistics.js'

const props = defineProps({
  summary: { type: Object, default: null },
})

const spread = computed(() => {
  if (!props.summary) return undefined
  return props.summary.max - props.summary.min
})

function fmt(v) {
  return smartFormat(v, spread.value)
}
</script>

<template>
  <div v-if="summary" class="results-summary">
    <div class="stat-grid">
      <div class="stat">
        <span class="stat-label">Simulations</span>
        <span class="stat-value">{{ summary.count.toLocaleString() }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Mean</span>
        <span class="stat-value">{{ fmt(summary.mean) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Median</span>
        <span class="stat-value">{{ fmt(summary.median) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Std. dev.</span>
        <span class="stat-value">{{ fmt(summary.stdDev) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Minimum</span>
        <span class="stat-value">{{ fmt(summary.min) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Maximum</span>
        <span class="stat-value">{{ fmt(summary.max) }}</span>
      </div>
    </div>
    <p class="disclaimer">
      Based on the selected model and assumptions, these are simulated possible outcomes—not a
      single guaranteed prediction.
    </p>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
