const { Transform } = require('stream')

/***
 * Given a kafka message, emit message.value, a buffer,  as a string
 */
module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM value`)

  return new Transform({
    objectMode: true,

    transform: (chunk, enc, cb) => {
      cb(null, chunk.value.toString())
    }
  })
}
