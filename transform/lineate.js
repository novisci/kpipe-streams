const { Transform } = require('stream')

/**
 * Take chunked input and insert newlines into the stream
 */

const BUFFER_SIZE = 16 * 1024 // Defaul to matching the default highwater mark

module.exports = function ({ lineateBufferSize } = {}) {
  lineateBufferSize = lineateBufferSize || BUFFER_SIZE

  console.info(`TRANSFORM lineate`)

  let buffer = Buffer.alloc(lineateBufferSize)
  let bufferIdx = 0
  let nStrings = 0
  let avgString = 0

  // Allocate a new buffer and reset stats
  function resetBuffer () {
    buffer = Buffer.alloc(lineateBufferSize)
    bufferIdx = 0
    avgString = nStrings = 0
  }

  // Push the current buffer downstream and start a new one
  function pushBuffer () {
    console.debug(`Push lineate buffer: ${bufferIdx} n: ${nStrings} avg: ${avgString.toFixed(1)} remain: ${lineateBufferSize - bufferIdx}`)
    stream.push(buffer.slice(0, bufferIdx))
    resetBuffer()
  } 

  // Accumulate string/buffer stats
  function accumulateStringLength (len) {
    avgString = (avgString * nStrings / (nStrings+1)) + len / (nStrings+1)
    nStrings++
  }

  // Add a string to the buffer. If the current buffer can't
  //  fit the string, push it downstream and start a new
  function addStringToBuffer (str, enc) {
    const len = Buffer.byteLength(str, enc)
    accumulateStringLength(len)
    if (len > lineateBufferSize) {
      if (len > lineateBufferSize * 2) {
        console.error(`WARNING: Lineate string is more than twice the buffer size`)
      }
      // String exceeds buffer size. Push the current buffer,
      //  push the entire string as a buffer, and reset the buffer
      pushBuffer()
      console.debug(`Push lineate large string: len: ${len}`)
      stream.push(Buffer.from(str, enc))
      return
    }
    if (len + bufferIdx > lineateBufferSize) {
      // Buffer cannot contain the string, push it and create a new one
      pushBuffer()
    }
    bufferIdx += buffer.write(str, bufferIdx, enc)
  }

  function flushBuffer () {
    console.debug('Flushing lineate buffer')
    stream.push(Buffer.from(buffer.slice(0, bufferIdx).toString()))
    buffer = null
    bufferIdx = 0
  }

  const stream = new Transform({
    writableObjectMode: true, // Reads string objects (single lines)
    readableObjectMode: false, // Writes buffers

    transform: (chunk, enc, cb) => {
      if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
        cb(Error(`Lineate chunks must be strings or buffers. Received ${typeof chunk}`))
      }
      addStringToBuffer(chunk.toString() + '\n', enc) // Add a newline to incoming strings
      cb()
    },
    flush: (cb) => {
      flushBuffer()
      cb()
    }
  })

  return stream
}
