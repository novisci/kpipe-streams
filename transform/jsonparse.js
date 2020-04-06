const { Transform } = require('stream')

module.exports = function ({ ignoreErrors } = {}) {
  ignoreErrors = typeof ignoreErrors !== 'undefined' ? !!ignoreErrors : false

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
        if (!ignoreErrors) {
          return cb(err)
        }
        console.error('ERROR: Skipping Invalid JSON --> ' + chunk)
      }
      cb(null, obj)
    }
  })
}
