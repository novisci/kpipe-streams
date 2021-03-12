module.exports = function ({ skip, objectMode } = {}) {
  skip = typeof skip === 'undefined' ? 10 : skip

  let count = 0
  return new (require('stream').Transform)({
    objectMode,

    transform: (chunk, enc, cb) => {
      if (count++ > skip) {
        if (Buffer.isBuffer(chunk)) {
          console.info('BUFFER: ' + chunk.toString())
        } else if (typeof chunk === 'string') {
          console.info('STRING: ' + chunk)
        } else if (typeof chunk === 'object') {
          console.info('OBJECT: ' + JSON.stringify(chunk))
        }
        count = 0
      }
      cb(null, chunk)
    }
  })
}
