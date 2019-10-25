const { Writable } = require('stream')

/***
 * A write stream which pipes data to a sequence of streams. Used for
 *  partitioning streams into separate streams.
 */
module.exports = function (options) {
  options = options || {}

  // options.stream is a function which takes a parition index
  //  and returns a readable steeam
  if (typeof options.stream !== 'function') {
    throw Error('options.stream must be a function')
  }

  // options.bound is a function which takes a state object
  //  and each chunk of incoming data (a reduce operation).
  //  The state object may be modified and is returned back
  //  on successive calls to bound(),
  //  The integer return indicates the offset into the string/buffer
  //  for the end of partition. If the end is not reached, -1 is returned
  if (typeof options.bound !== 'function') {
    throw Error('options.bound must be a function')
  }

  const fnStream = options.stream
  const fnBound = options.bound

  let index = 0
  let current = fnStream(0)
  const state = {}

  function _flush (cb) {
    // Flush the current pipe
    current.end()
    current.once('finish', () => {
      // console.debug('received finish')
      current.destroy()
      cb()
    })
  }

  // let count = 0
  let paused = false
  let remainder = null

  function _write (chunk, enc, cb) {
    if (paused) {
      // process.stderr.write('!')
      current.once('drain', () => _write(chunk, enc, cb))
      return false
    }

    if (!Buffer.isBuffer(chunk)) {
      return cb(Error('partition currently implements buffer streams only'))
    }

    // Split the buffer by the returned partition end offset (unless -1)
    const off = fnBound(state, chunk)
    if (off >= 0) {
      remainder = chunk.slice(off + 1)
      // console.error('OFF ' + off)
      // console.error('LENGTH ' + chunk.length)
      // console.error('REMAIN ' + remainder)
      chunk = chunk.slice(0, off + 1) // Buffer.from(chunk, 0, off)
    } else if (remainder) {
      chunk = Buffer.concat([remainder, chunk])
      // console.error('CHUNK ' + chunk)
      remainder = null
    }

    // Write out this chunk
    const ret = current.write(chunk, enc)

    // If we reached the end, cycle the stream
    if (off >= 0) {
      _flush(() => {
        index += 1
        // console.debug('next stream')
        current = fnStream(index)
        cb()
      })
      return false
    } else if (!ret) {
      paused = true
      // console.debug('paused')
      current.once('drain', () => {
        paused = false
        // console.debug('unpaused')
        cb()
      })
      return false
    }

    cb()
    return true
  }

  const stream = new Writable({
    write: _write,
    final: _flush
  })

  stream.on('error', (err) => {
    console.error(err)
    stream.destroy(err)
  })

  return stream
}
