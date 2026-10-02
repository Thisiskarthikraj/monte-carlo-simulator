<script setup>
const model = defineModel({ type: Number, default: 90 })

const options = [50, 75, 80, 90, 95, 99]
</script>

<template>
  <div class="planning-confidence">
    <label class="field-label" for="planning">Planning confidence</label>
    <p class="field-hint">
      Higher values suggest preparing for busier scenarios (higher percentiles), not a guaranteed outcome.
    </p>
    <select id="planning" v-model.number="model">
      <option v-for="p in options" :key="p" :value="p">{{ p }}%</option>
    </select>
  </div>
</template>
