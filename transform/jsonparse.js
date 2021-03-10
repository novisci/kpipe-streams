const { Transform } = require('stream')

module.exports = function ({ ignoreErrors } = {}) {
  ignoreErrors = typeof ignoreErrors !== 'undefined' ? !!ignoreErrors : false

  console.info('TRANSFORM JSONParse')

  return new Transform({
    objectMode: true,

    transform: (chunk, enc, cb) => {
      let obj
      try {
        obj = JSON.parse(chunk)
      } catch (err) {
        obj = null
        if (!ignoreErrors) {
          console.error('ERROR: Invalid JSON --> ' + chunk)
          return cb(err)
        }
        console.error('WARNING: Skipping Invalid JSON --> ' + chunk)
      }
      cb(null, obj)
    }
  })
}
