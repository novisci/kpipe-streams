const { Transform } = require('stream')

module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM JSONparse`)

  return new Transform({
    readableObjectMode: true,
    writableObjectMode: false,

    transform: (chunk, enc, cb) => {
      let obj
      try {
        obj = JSON.parse(chunk)
      } catch (err) {
        obj = null
        return cb(err)
      }
      cb(null, obj)
    }
  })
}
