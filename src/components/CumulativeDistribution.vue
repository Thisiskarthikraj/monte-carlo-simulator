<script setup>
import CdfChart from './CdfChart.vue'

defineProps({
  cdf: { type: Array, default: () => [] },
})
</script>

<template>
  <CdfChart :cdf="cdf" />
</template>
