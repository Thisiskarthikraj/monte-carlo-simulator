<script setup>
import { SIMULATION_PRESETS, DEFAULT_SIMULATIONS } from '../simulation/monteCarlo.js'

const simulationCount = defineModel({ type: [Number, String], default: DEFAULT_SIMULATIONS })

defineProps({
  running: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  canRun: { type: Boolean, default: true },
  runError: { type: String, default: null },
})

const emit = defineEmits(['run'])

function setPreset(n) {
  simulationCount.value = n
}
</script>

<template>
  <div class="sim-settings">
    <label class="field-label" for="sim-count">Number of simulations</label>
    <input
      id="sim-count"
      v-model.number="simulationCount"
      type="number"
      min="100"
      step="1000"
    />
    <div class="chip-row">
      <button
        v-for="preset in SIMULATION_PRESETS"
        :key="preset"
        type="button"
        class="btn-secondary"
        @click="setPreset(preset)"
      >
        {{ preset.toLocaleString() }}
      </button>
    </div>

    <div class="run-block">
      <button
        type="button"
        class="btn-primary run-btn"
        :disabled="running || !canRun"
        @click="emit('run')"
      >
        <span v-if="running">Running… {{ Math.round(progress * 100) }}%</span>
        <span v-else>Run simulation</span>
      </button>
      <div v-if="running" class="progress-bar" aria-hidden="true">
        <div class="progress-fill" :style="{ width: `${progress * 100}%` }" />
      </div>
      <p v-if="runError" class="field-error" role="alert">{{ runError }}</p>
    </div>
  </div>
</template>

<style scoped>
.run-block {
  margin-top: 1.25rem;
}

.run-btn {
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
</style>
