<script setup>
import { ref, computed } from 'vue'
import {
  probabilityLe,
  probabilityGe,
  probabilityBetween,
  formatPercent,
} from '../simulation/statistics.js'

const props = defineProps({
  samples: { type: Object, default: null },
})

const queryType = ref('ge')
const valueA = ref('')
const valueB = ref('')
const result = ref(null)
const queryError = ref(null)

const hasSamples = computed(() => props.samples && props.samples.length > 0)

function calculate() {
  queryError.value = null
  result.value = null

  if (!hasSamples.value) {
    queryError.value = 'Run a simulation first.'
    return
  }

  const a = Number(valueA.value)
  if (!Number.isFinite(a)) {
    queryError.value = 'Enter a valid number.'
    return
  }

  let prob
  let description

  if (queryType.value === 'le') {
    prob = probabilityLe(props.samples, a)
    description = `P(X ≤ ${a})`
  } else if (queryType.value === 'ge') {
    prob = probabilityGe(props.samples, a)
    description = `P(X ≥ ${a})`
  } else {
    const b = Number(valueB.value)
    if (!Number.isFinite(b)) {
      queryError.value = 'Enter valid lower and upper bounds.'
      return
    }
    prob = probabilityBetween(props.samples, a, b)
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    description = `P(${lo} ≤ X ≤ ${hi})`
  }

  result.value = { description, probability: prob }
}
</script>

<template>
  <div class="prob-calc">
    <div class="query-row">
      <select v-model="queryType" aria-label="Query type">
        <option value="le">P(X ≤ value)</option>
        <option value="ge">P(X ≥ value)</option>
        <option value="between">P(a ≤ X ≤ b)</option>
      </select>
    </div>

    <div class="values-row">
      <input
        v-model="valueA"
        type="number"
        step="any"
        :placeholder="queryType === 'between' ? 'Lower (a)' : 'Value'"
        aria-label="Threshold value"
      />
      <input
        v-if="queryType === 'between'"
        v-model="valueB"
        type="number"
        step="any"
        placeholder="Upper (b)"
        aria-label="Upper bound"
      />
      <button type="button" class="btn-secondary calc-btn" :disabled="!hasSamples" @click="calculate">
        Calculate
      </button>
    </div>

    <p v-if="queryError" class="field-error" role="alert">{{ queryError }}</p>

    <div v-if="result" class="result-box">
      <span class="result-label">{{ result.description }}</span>
      <span class="result-value">Probability {{ formatPercent(result.probability) }}</span>
      <span class="result-note">Estimated from simulation results.</span>
    </div>
  </div>
</template>

<style scoped>
.query-row {
  margin-bottom: 0.75rem;
}

.values-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.values-row input {
  flex: 1;
  min-width: 6rem;
}

.calc-btn {
  flex-shrink: 0;
}

.result-box {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.result-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-hover);
}

.result-note {
  font-size: 0.8125rem;
  color: var(--text-muted);
}
</style>
