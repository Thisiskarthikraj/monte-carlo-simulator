<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps({
  cdf: { type: Array, default: () => [] },
})

const chartData = computed(() => {
  if (!props.cdf?.length) return { datasets: [] }
  return {
    datasets: [
      {
        label: 'CDF',
        data: props.cdf.map((p) => ({ x: p.x, y: p.y })),
        borderColor: 'rgba(61, 107, 158, 1)',
        backgroundColor: 'rgba(61, 107, 158, 0.08)',
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  parsing: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const x = ctx.raw.x
          const y = ctx.raw.y
          return [
            `Value: ${Number(x).toLocaleString(undefined, { maximumFractionDigits: 3 })}`,
            `P(X ≤ x): ${(y * 100).toFixed(1)}%`,
          ]
        },
      },
    },
  },
  scales: {
    x: {
      type: 'linear',
      title: { display: true, text: 'Value', color: '#5c6370' },
      ticks: { maxTicksLimit: 8 },
    },
    y: {
      min: 0,
      max: 1,
      title: { display: true, text: 'Cumulative probability', color: '#5c6370' },
      ticks: {
        callback: (v) => `${(v * 100).toFixed(0)}%`,
      },
    },
  },
}

const chartKey = computed(() => (props.cdf?.length ? props.cdf.length : 0))
</script>

<template>
  <div v-if="cdf?.length" class="chart-wrap">
    <Line :key="chartKey" :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrap {
  height: 260px;
  position: relative;
}
</style>
