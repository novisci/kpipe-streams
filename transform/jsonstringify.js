const { Transform } = require('stream')

module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM JSONstringify`)

  return new Transform({
    readableObjectMode: false,
    writableObjectMode: true,

    transform: (chunk, enc, cb) => {
      cb(null, Buffer.from(JSON.stringify(chunk), 'utf8'))
    }
  })
}
