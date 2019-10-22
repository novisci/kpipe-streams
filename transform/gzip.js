module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM gzip`)

  return require('zlib').createGzip()
}
