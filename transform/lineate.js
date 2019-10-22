const { Transform } = require('stream')

/**
 * Take chunked input and insert newlines into the stream
 */
module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM lineate`)

  const stream = new Transform({
    writableObjectMode: true,
    readableObjectMode: false,

    transform: (chunk, enc, cb) => {
      if (typeof chunk === 'string') {
        cb(null, chunk + '\n')
      } else if (Buffer.isBuffer(chunk)) {
        cb(null, Buffer.concat([chunk, Buffer.from('\n')]))
      } else {
        cb(Error('transform/lineate chunks must be buffers or strings'))
      }
    }
  })

  return stream
}
