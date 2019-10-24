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
  //  A return value of true indicates that a partition boundary
  //  has been reaches and the next stream will be requested
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

  function _write (chunk, enc, cb) {
    if (paused) {
      // process.stderr.write('!')
      current.once('drain', () => _write(chunk, enc, cb))
      return false
    }

    const ret = current.write(chunk, enc)

    if (fnBound(state, chunk)) {
      // console.debug('end stream')
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
