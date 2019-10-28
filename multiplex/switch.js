/***
 * A writable stream which accepts objects of the form { topic: <string>, message: <string>|<buffer>}
 *  and routes the supplied message to the indicated topic. The switch will manage the streams required
 *  to post to the topics provided. It will lazily create streams as needed to supply the topics.
 */
module.exports = function ({ producerOpts } = {}) {
  const _topics = {}
  const _writer = require('kpipe-core').Writer({
    type: 'kafka',
    brokers: process.env.DPIPE_BROKERS,
    ...producerOpts
  })

  function _topic (t) {
    if (typeof _topics[t] === 'undefined') {
      _topics[t] = _writer(t)
    }
    return _topics[t]
  }

  function _write (obj, enc, cb) {
    if (typeof obj !== 'object' || typeof obj.topic !== 'string' || typeof obj.message !== 'string') {
      return cb(Error('switch chunks must be objects with properties topic and message'))
    }

    return _topic(obj.topic).write(obj.message, enc, (err) => {
      if (err) {
        stream.emit('error', err)
      }
      cb(err)
    })
  }

  const stream = new (require('stream').Writable)({
    objectMode: true,
    write: _write
  })

  stream.on('error', (err) => {
    console.error(err)
    stream.destroy()
  })

  stream.on('finish', () => {
    console.info('SWITCH event: finish')
    Object.values(_topics).map((t) => t.destroy())
  })

  return stream
}
