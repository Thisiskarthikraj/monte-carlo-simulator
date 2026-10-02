<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <details class="how-it-works" :open="open" @toggle="open = $event.target.open">
    <summary>How it works</summary>
    <div class="body">
      <p>
        Monte Carlo simulation runs an experiment many times using random samples. Instead of
        producing a single answer, it shows how possible outcomes are distributed.
      </p>
      <ol>
        <li>Enter historical or sample data.</li>
        <li>Choose how random values should be generated (empirical or a theoretical distribution).</li>
        <li>Run thousands or millions of trials in your browser.</li>
        <li>Explore the spread through statistics, charts, and probability questions.</li>
      </ol>
    </div>
  </details>
</template>

<style scoped>
.how-it-works {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 0.75rem 1rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text);
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
  transition: transform 0.15s;
}

details[open] summary::before {
  transform: rotate(90deg);
}

.body {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.body p {
  margin: 0 0 0.75rem;
}

.body ol {
  margin: 0;
  padding-left: 1.25rem;
}

.body li {
  margin-bottom: 0.35rem;
}
</style>
