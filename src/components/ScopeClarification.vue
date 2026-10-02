<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: { type: String, required: true },
})

const scopeChoice = defineModel('scopeChoice', { type: String, default: '' })
const timeValue = defineModel('timeValue', { type: String, default: '12:00' })

const localScope = ref(scopeChoice.value || '')

watch(localScope, (v) => {
  scopeChoice.value = v
})

watch(
  () => scopeChoice.value,
  (v) => {
    localScope.value = v
  },
)
</script>

<template>
  <div class="scope-card" role="region" aria-label="Clarify time scope">
    <p class="scope-message">{{ message }}</p>
    <div class="scope-options">
      <label class="radio">
        <input v-model="localScope" type="radio" value="whole_day" />
        Entire day (sum or total for the day)
      </label>
      <label class="radio">
        <input v-model="localScope" type="radio" value="point" />
        Specific time
      </label>
    </div>
    <div v-if="localScope === 'point'" class="time-pick">
      <label class="field-label" for="scope-time">Time</label>
      <input id="scope-time" v-model="timeValue" type="text" placeholder="10:00 AM" />
    </div>
  </div>
</template>

<style scoped>
.scope-card {
  padding: 1rem;
  background: var(--error-bg);
  border: 1px solid #e8c4c4;
  border-radius: var(--radius-sm);
}

.scope-message {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
}

.scope-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  cursor: pointer;
}

.time-pick {
  margin-top: 0.75rem;
}
</style>
