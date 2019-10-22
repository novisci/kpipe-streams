module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM snappy-uncompress`)

  const stream = require('../node-snappy-stream').createUncompressStream()

  // const stream = new (require('stream').Transform)({
  //   objectMode: false,

  //   transform: (chunk, enc, cb) => {
  //     if (!Buffer.isBuffer(chunk)) {
  //       return cb(Error('transform/snappy-uncompress requires a buffer'))
  //     }
  //     require('snappy').uncompress(chunk, (err, comp) => {
  //       if (err) {
  //         cb(err)
  //       }
  //       cb(null, comp)
  //     })
  //   }
  // })

  return stream
}
