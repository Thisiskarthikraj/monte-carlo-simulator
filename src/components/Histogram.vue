<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  histogram: { type: Object, default: null },
})

const chartData = computed(() => {
  if (!props.histogram?.bins?.length) {
    return { labels: [], datasets: [] }
  }
  return {
    labels: props.histogram.bins.map((b) => b.label),
    datasets: [
      {
        label: 'Frequency',
        data: props.histogram.bins.map((b) => b.count),
        backgroundColor: 'rgba(61, 107, 158, 0.75)',
        borderColor: 'rgba(61, 107, 158, 1)',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => items[0]?.label ?? '',
        label: (ctx) => `Count: ${ctx.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Value (bin range)', color: '#5c6370' },
      ticks: { maxRotation: 45, minRotation: 0, autoSkip: true, maxTicksLimit: 12 },
      grid: { display: false },
    },
    y: {
      title: { display: true, text: 'Frequency', color: '#5c6370' },
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
}

const chartKey = computed(() =>
  props.histogram ? `${props.histogram.min}-${props.histogram.max}-${props.histogram.bins.length}` : 'empty',
)
</script>

<template>
  <div v-if="histogram" class="chart-wrap">
    <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrap {
  height: 280px;
  position: relative;
}
</style>
