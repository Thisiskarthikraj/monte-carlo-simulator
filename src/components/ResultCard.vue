<script setup>
defineProps({
  decision: { type: Object, default: null },
  running: { type: Boolean, default: false },
})
</script>

<template>
  <section v-if="decision && !running" class="result-card">
    <p class="result-label">Result</p>
    <h2 class="headline">{{ decision.headline }}</h2>
    <p v-if="decision.subheadline" class="subheadline">{{ decision.subheadline }}</p>

    <div class="planning-banner">
      <p class="planning-intro">
        If you want to plan for approximately {{ decision.planningConfidence }}% of simulated demand:
      </p>
      <p class="planning-value">
        Plan for ~{{ decision.metrics.planningRounded }}
        <span class="unit">{{ decision.unit.toLowerCase() }}</span>
      </p>
    </div>

    <p class="planning-explain">{{ decision.planningAction }}</p>

    <dl class="key-metrics">
      <div>
        <dt>Expected value</dt>
        <dd>{{ decision.metrics.expected }}</dd>
      </div>
      <div>
        <dt>Median</dt>
        <dd>{{ decision.metrics.median }}</dd>
      </div>
      <div>
        <dt>Planning percentile</dt>
        <dd>{{ decision.planningPercentileLabel }}</dd>
      </div>
      <div>
        <dt>Planning value</dt>
        <dd>{{ decision.metrics.planningValue }}</dd>
      </div>
    </dl>

    <div class="why">
      <p class="why-title">Why?</p>
      <ul>
        <li v-for="(line, i) in decision.whyBullets" :key="i">{{ line }}</li>
      </ul>
      <p class="honesty">
        Monte Carlo shows possible outcomes under your data and model—it does not guarantee a future
        value.
      </p>
    </div>
  </section>
</template>

<style scoped>
.result-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.75rem 1.5rem;
  box-shadow: var(--shadow);
}

.result-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.headline {
  margin: 0.5rem 0 0;
  font-size: clamp(1.35rem, 3.5vw, 1.65rem);
  line-height: 1.35;
  font-weight: 600;
}

.subheadline {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.planning-banner {
  margin-top: 1.5rem;
  padding: 1.25rem 1.35rem;
  background: linear-gradient(180deg, var(--accent-soft) 0%, #f0f6fc 100%);
  border-radius: var(--radius);
  border: 1px solid #c5d9eb;
}

.planning-intro {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.planning-value {
  margin: 0.5rem 0 0;
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  font-weight: 700;
  color: var(--accent-hover);
  letter-spacing: -0.02em;
}

.unit {
  font-size: 1rem;
  font-weight: 600;
}

.planning-explain {
  margin: 1rem 0 0;
  font-size: 0.9375rem;
  color: var(--text);
}

.key-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 1rem;
  margin: 1.5rem 0 0;
  padding: 0;
}

.key-metrics div {
  padding: 0.65rem 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

.key-metrics dt {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.key-metrics dd {
  margin: 0.2rem 0 0;
  font-size: 1.0625rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.why {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}

.why-title {
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.why ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.why li {
  margin-bottom: 0.25rem;
}

.honesty {
  margin: 0.75rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-style: italic;
}

@media (min-width: 640px) {
  .key-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
