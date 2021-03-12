const statsInit = () => ({
  bytes: 0,
  chunks: 0
})

const rates = (stats, dt) => ({
  dbytesdt: stats.bytes / dt,
  dchunksdt: stats.chunks / dt
})

const accumInit = (t0 = Date.now(), mem0 = process.memoryUsage()) => ({
  startTime: t0 * 0.001,
  lastTime: t0 * 0.001,
  dT: 0,
  elapsedT: 0,
  totalMBytes: 0,
  totalKChunks: 0,
  startMem: mem0.heapUsed + mem0.external,
  highMem: mem0.heapUsed + mem0.external,
  lastMem: mem0.heapUsed + mem0.external
})

const dM = 1 / (1024 * 1024)
const dK = 1 / (1024)

const accumulate = (accum, stats, t = Date.now(), mem = process.memoryUsage()) => {
  return {
    startTime: accum.startTime,
    lastTime: t * 0.001,
    dT: (t * 0.001) - accum.lastTime,
    elapsedT: (t * 0.001) - accum.startTime,
    totalMBytes: accum.totalMBytes + stats.bytes * dM,
    totalKChunks: accum.totalKChunks + stats.chunks * dK,
    startMem: accum.startMem,
    highMem: Math.max(accum.highMem, mem.heapUsed + mem.external),
    lastMem: mem.heapUsed + mem.external
  }
}

module.exports = function ({ intervalMs, objectMode, label } = {}) {
  const reportInterval = intervalMs || 5000

  objectMode = typeof objectMode === 'undefined' ? false : !!objectMode

  let stats = statsInit()
  let totals = accumInit()

  function report () {
    totals = accumulate(totals, stats)
    const r = rates(stats, totals.dT)

    console.info('JSON ' + JSON.stringify({
      type: 'throughput',
      label: label || 'pipeline',
      t: (totals.elapsedT).toFixed(3),
      kc: (totals.totalKChunks).toFixed(3),
      kc_dt: (r.dchunksdt * dK).toFixed(3),
      mb: (totals.totalMBytes).toFixed(3),
      mb_dt: (r.dbytesdt * dM).toFixed(3),
      mbheap: (totals.lastMem * dM).toFixed(3)
    }))

    stats = statsInit()
  }

  let reportHandle = setInterval(() => report(), reportInterval)

  const stream = new (require('stream').Transform)({
    objectMode,
    transform: (chunk, enc, cb) => {
      stats.chunks++
      if (Buffer.isBuffer(chunk) || typeof chunk === 'string') {
        stats.bytes += chunk.length
      }
      cb(null, chunk)
    },
    flush: (cb) => {
      clearInterval(reportHandle)
      reportHandle = null
      report()
      // summary()
      cb()
    }
  })
  stream.on('close', (e) => {
    clearInterval(reportHandle)
  })

  return stream
}
