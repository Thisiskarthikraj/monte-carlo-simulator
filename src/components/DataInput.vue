<script setup>
import { computed } from 'vue'
import DataTable from './DataTable.vue'
import TimeGranularity from './TimeGranularity.vue'
import { parseSimpleData } from '../data/historicalData.js'

const dataMode = defineModel('dataMode', { type: String, default: 'simple' })
const simpleText = defineModel('simpleText', { type: String, default: '' })
const tableRows = defineModel('tableRows', { type: Array, default: () => [] })
const granularityMinutes = defineModel('granularityMinutes', { type: Number, default: 60 })
const variableName = defineModel('variableName', { type: String, default: 'Quantity' })

defineProps({
  csvError: { type: String, default: null },
})

const emit = defineEmits(['import-csv'])

const simpleParsed = computed(() => parseSimpleData(simpleText.value))
const simpleCount = computed(() => simpleParsed.value.values.length)
</script>

<template>
  <div class="data-input">
    <div class="variable-row">
      <label class="field-label" for="variable">Variable name</label>
      <input
        id="variable"
        v-model="variableName"
        type="text"
        placeholder="Quantity / Demand / Cars"
      />
      <p class="field-hint">How to label the thing you are estimating (any domain).</p>
    </div>

    <div class="mode-toggle" role="radiogroup" aria-label="Data mode">
      <label class="mode-option">
        <input v-model="dataMode" type="radio" value="simple" />
        Simple values
      </label>
      <label class="mode-option">
        <input v-model="dataMode" type="radio" value="timeaware" />
        Time-aware data
      </label>
    </div>

    <template v-if="dataMode === 'simple'">
      <label class="field-label" for="simple-data">Historical values</label>
      <textarea
        id="simple-data"
        v-model="simpleText"
        placeholder="10, 11, 15, 10, 20"
        rows="4"
        spellcheck="false"
      />
      <p v-if="simpleCount && !simpleParsed.error" class="obs-count">
        {{ simpleCount }} observation{{ simpleCount === 1 ? '' : 's' }}
      </p>
      <p v-if="simpleParsed.error && simpleText.trim()" class="field-error">{{ simpleParsed.error }}</p>
    </template>

    <template v-else>
      <TimeGranularity v-model="granularityMinutes" />
      <DataTable
        v-model="tableRows"
        :granularity-minutes="granularityMinutes"
        @import-csv="emit('import-csv', $event)"
      />
      <p v-if="csvError" class="field-error">{{ csvError }}</p>
    </template>
  </div>
</template>

<style scoped>
.data-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9375rem;
  cursor: pointer;
}

.obs-count {
  margin: 0.35rem 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--accent);
}
</style>
