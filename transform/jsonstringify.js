const { Transform } = require('stream')

module.exports = function (options) {
  options = options || {}

  console.info('TRANSFORM JSONStringify')

  return new Transform({
    objectMode: true,

    transform: (chunk, enc, cb) => {
      cb(null, JSON.stringify(chunk), 'utf8')
    }
  })
}
