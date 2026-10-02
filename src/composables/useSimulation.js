import { ref, shallowRef } from 'vue'
import SimulationWorker from '../workers/simulation.worker.js?worker'

export function useSimulation() {
  const running = ref(false)
  const progress = ref(0)
  const error = ref(null)
  const summary = shallowRef(null)
  const histogram = shallowRef(null)
  const cdf = shallowRef(null)
  /** @type {import('vue').ShallowRef<Float64Array | null>} */
  const samples = shallowRef(null)

  let worker = null

  function terminateWorker() {
    if (worker) {
      worker.terminate()
      worker = null
    }
  }

  function run(config) {
    terminateWorker()
    running.value = true
    progress.value = 0
    error.value = null
    summary.value = null
    histogram.value = null
    cdf.value = null
    samples.value = null

    worker = new SimulationWorker()

    worker.onmessage = (event) => {
      const { type } = event.data
      if (type === 'progress') {
        progress.value = event.data.progress
      } else if (type === 'error') {
        error.value = event.data.error
        running.value = false
        terminateWorker()
      } else if (type === 'done') {
        summary.value = event.data.summary
        histogram.value = event.data.histogram
        cdf.value = event.data.cdf
        samples.value = event.data.samples
        progress.value = 1
        running.value = false
        terminateWorker()
      }
    }

    worker.onerror = () => {
      error.value = 'Simulation worker encountered an error.'
      running.value = false
      terminateWorker()
    }

    worker.postMessage({ type: 'run', payload: config })
  }

  return {
    running,
    progress,
    error,
    summary,
    histogram,
    cdf,
    samples,
    run,
  }
}
