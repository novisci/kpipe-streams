module.exports = function (options) {
  options = options || {}

  console.info(`TRANSFORM snappy-compress`)

  const stream = require('../node-snappy-stream').createCompressStream()

  // const stream = new (require('stream').Transform)({
  //   objectMode: false,

  //   transform: (chunk, enc, cb) => {
  //     if (!Buffer.isBuffer(chunk)) {
  //       return cb(Error('transform/snappy-compress requires a buffer'))
  //     }
  //     require('snappy').compress(chunk, (err, comp) => {
  //       // console.debug(comp.toString())
  //       if (err) {
  //         cb(err)
  //       }
  //       cb(null, comp.toString())
  //     })
  //   }
  // })

  return stream
}
