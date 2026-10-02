<script setup>
import { EXAMPLE_QUESTIONS } from '../query/questionParser.js'

const model = defineModel({ type: String, default: '' })

defineProps({
  disabled: { type: Boolean, default: false },
})

function useExample(q) {
  model.value = q
}
</script>

<template>
  <div class="question-input">
    <label class="field-label" for="question">Your question</label>
    <p class="field-hint">Ask a practical question about what you want to estimate.</p>
    <textarea
      id="question"
      v-model="model"
      class="question-field"
      rows="2"
      placeholder="How many cars can I expect at 10 AM tomorrow?"
      :disabled="disabled"
    />
    <div class="examples">
      <span class="examples-label">Examples</span>
      <ul class="example-list">
        <li v-for="q in EXAMPLE_QUESTIONS" :key="q">
          <button type="button" class="example-btn" :disabled="disabled" @click="useExample(q)">
            {{ q }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.question-field {
  font-size: 1.0625rem;
  line-height: 1.45;
  min-height: 3.5rem;
}

.examples {
  margin-top: 1rem;
}

.examples-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.example-list {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.example-btn {
  text-align: left;
  width: 100%;
  padding: 0.5rem 0.65rem;
  font-size: 0.8125rem;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  line-height: 1.4;
}

.example-btn:hover:not(:disabled) {
  background: var(--accent-soft);
  border-color: transparent;
}

.example-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
