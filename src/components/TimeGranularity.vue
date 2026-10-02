<script setup>
import { GRANULARITY_OPTIONS } from '../data/historicalData.js'

const model = defineModel({ type: Number, default: 60 })
</script>

<template>
  <div class="granularity">
    <label class="field-label" for="granularity">Time granularity</label>
    <p class="field-hint">Match how your historical data is recorded.</p>
    <select id="granularity" v-model.number="model">
      <option v-for="opt in GRANULARITY_OPTIONS" :key="opt.minutes" :value="opt.minutes">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
