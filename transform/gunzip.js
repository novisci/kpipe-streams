module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM gunzip`)

  return require('zlib').createGunzip()
}
