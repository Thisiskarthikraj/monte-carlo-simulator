import { runMonteCarlo, prepareRun } from '../simulation/monteCarlo.js'

self.onmessage = (event) => {
  const { type, payload } = event.data
  if (type !== 'run') return

  const prepared = prepareRun(payload)
  if (prepared.error) {
    self.postMessage({ type: 'error', error: prepared.error })
    return
  }

  try {
    const result = runMonteCarlo({
      sampler: prepared.sampler,
      count: prepared.count,
      onProgress: (progress) => {
        self.postMessage({ type: 'progress', progress })
      },
    })

    self.postMessage(
      {
        type: 'done',
        summary: {
          count: result.summary.count,
          mean: result.summary.mean,
          median: result.summary.median,
          stdDev: result.summary.stdDev,
          min: result.summary.min,
          max: result.summary.max,
          percentiles: result.summary.percentiles,
        },
        histogram: result.histogram,
        cdf: result.cdf,
        samples: result.samples,
      },
      [result.samples.buffer],
    )
  } catch (err) {
    self.postMessage({
      type: 'error',
      error: err instanceof Error ? err.message : 'Simulation failed.',
    })
  }
}
