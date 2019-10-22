var Transform = require('stream').Transform
var util = require('util')

var snappy = require('snappy')

var checksum = require('./checksum')

var IDENTIFIER_FRAME = Buffer.from([
  0xff, 0x06, 0x00, 0x00, 0x73, 0x4e, 0x61, 0x50, 0x70, 0x59
])
var COMPRESSED = Buffer.from([ 0x00 ])
var UNCOMPRESSED = Buffer.from([ 0x01 ])

var CompressStream = function () {
  if (!(this instanceof CompressStream)) {
    return new CompressStream()
  }

  Transform.call(this)

  // first push the identifier frame
  this.push(IDENTIFIER_FRAME)
}

util.inherits(CompressStream, Transform)

CompressStream.prototype._compressed = function (chunk, compressed) {
  var size = compressed.length + 4

  this.push(
    Buffer.concat([
      COMPRESSED,
      Buffer.from([ size, size >> 8, size >> 16 ]),
      checksum(chunk),
      compressed
    ])
  )
}

CompressStream.prototype._uncompressed = function (chunk) {
  var size = chunk.length + 4

  this.push(
    Buffer.concat([
      UNCOMPRESSED,
      Buffer.from([ size, size >> 8, size >> 16 ]),
      checksum(chunk),
      chunk
    ])
  )
}

CompressStream.prototype._transform = function (chunk, enc, callback) {
  var self = this

  snappy.compress(chunk, function (err, compressed) {
    if (err) {
      return callback(err)
    }

    if (compressed.length < chunk.length) {
      self._compressed(chunk, compressed)
    } else {
      self._uncompressed(chunk)
    }

    callback()
  })
}

module.exports = CompressStream
