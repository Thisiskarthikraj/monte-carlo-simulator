<script setup>
import { computed } from 'vue'
import { PERCENTILE_LEVELS, smartFormat } from '../simulation/statistics.js'

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
  <div v-if="summary" class="percentiles">
    <div class="pct-grid">
      <div v-for="level in PERCENTILE_LEVELS" :key="level" class="pct-row">
        <span class="pct-label">P{{ level }}</span>
        <span class="pct-value">{{ fmt(summary.percentiles[level]) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pct-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
  gap: 0.5rem;
}

.pct-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
  font-variant-numeric: tabular-nums;
}

.pct-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-muted);
}

.pct-value {
  font-weight: 600;
}
</style>
