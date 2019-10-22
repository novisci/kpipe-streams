const { Transform } = require('stream')

/**
 * Transform an arbitrary buffer input by newlines
 */
module.exports = function (options) {
  options = options || {}

  let remainder = ''

  console.info(`TRANSFORM delineate`)

  const stream = new Transform({
    writableObjectMode: false,
    readableObjectMode: true,

    transform: (chunk, enc, cb) => {
      // console.debug(chunk.toString())
      const str = remainder + chunk.toString()
      const lastNewline = str.lastIndexOf('\n')
      if (lastNewline === -1) {
        // No newlines this chunk
        remainder = str
        cb()
        return
      }
      // Store the trailing
      remainder = str.slice(lastNewline + 1)
      const lines = str.slice(0, lastNewline).toString().split('\n')

      lines.map((l) => {
        if (!stream.push(l)) {
          // console.debug('WARNING: Unhandled backpressure in transform/delineate')
        }
      })
      cb()
    },
    flush: (cb) => {
      if (remainder) {
        stream.push(remainder)
      }
      cb()
      remainder = ''
    }
  })

  return stream
}
