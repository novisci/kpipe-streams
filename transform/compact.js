const { Transform } = require('stream')

function compactObj (o) {
  if (Array.isArray(o)) {
    return o.map((v) => compactObj(v))
  } else if (typeof o === 'object') {
    return Object.values(o).map(compactObj)
  } else {
    return o
  }
}

module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM compact`)

  const stream = new Transform({
    objectMode: true,
    transform: (chunk, enc, cb) => {
      if (!stream.push(compactObj(chunk))) {
        // Backpressure
        // console.debug('WARNING: Unhandled backpressure in transform/compact')
      }
      cb()
    }
  })

  return stream
}
