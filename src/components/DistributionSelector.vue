<script setup>
import { watch } from 'vue'
import {
  DISTRIBUTION_IDS,
  DISTRIBUTION_LABELS,
  getDefaultParams,
} from '../simulation/distributions/index.js'

const distributionId = defineModel('distributionId', { type: String, required: true })
const params = defineModel('params', { type: Object, required: true })

const props = defineProps({
  values: { type: Array, default: () => [] },
})

const options = [
  DISTRIBUTION_IDS.EMPIRICAL,
  DISTRIBUTION_IDS.NORMAL,
  DISTRIBUTION_IDS.UNIFORM,
  DISTRIBUTION_IDS.TRIANGULAR,
]

function applyDefaults() {
  if (props.values.length === 0) return
  const defaults = getDefaultParams(distributionId.value, props.values)
  params.value = { ...defaults }
}

watch(
  () => [distributionId.value, props.values],
  () => {
    applyDefaults()
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div class="distribution">
    <label class="field-label" for="distribution">Distribution</label>
    <select id="distribution" v-model="distributionId">
      <option v-for="id in options" :key="id" :value="id">
        {{ DISTRIBUTION_LABELS[id] }}
      </option>
    </select>

    <p v-if="distributionId === DISTRIBUTION_IDS.EMPIRICAL" class="field-hint dist-note">
      Each simulation draws one value at random from your observations (with replacement).
    </p>

    <div v-if="distributionId === DISTRIBUTION_IDS.NORMAL" class="param-grid">
      <div>
        <label class="field-label" for="normal-mean">Mean</label>
        <input id="normal-mean" v-model.number="params.mean" type="number" step="any" />
      </div>
      <div>
        <label class="field-label" for="normal-std">Standard deviation</label>
        <input id="normal-std" v-model.number="params.stdDev" type="number" step="any" min="0" />
      </div>
    </div>

    <div v-if="distributionId === DISTRIBUTION_IDS.UNIFORM" class="param-grid">
      <div>
        <label class="field-label" for="uniform-min">Min</label>
        <input id="uniform-min" v-model.number="params.min" type="number" step="any" />
      </div>
      <div>
        <label class="field-label" for="uniform-max">Max</label>
        <input id="uniform-max" v-model.number="params.max" type="number" step="any" />
      </div>
    </div>

    <div v-if="distributionId === DISTRIBUTION_IDS.TRIANGULAR" class="param-grid param-grid-3">
      <div>
        <label class="field-label" for="tri-min">Min</label>
        <input id="tri-min" v-model.number="params.min" type="number" step="any" />
      </div>
      <div>
        <label class="field-label" for="tri-mode">Mode (peak)</label>
        <input id="tri-mode" v-model.number="params.mode" type="number" step="any" />
      </div>
      <div>
        <label class="field-label" for="tri-max">Max</label>
        <input id="tri-max" v-model.number="params.max" type="number" step="any" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dist-note {
  margin-top: 0.75rem;
}

.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.param-grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

@media (max-width: 640px) {
  .param-grid,
  .param-grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
