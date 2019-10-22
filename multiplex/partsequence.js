const Partition = require('./partition')

/***
 * A specialization of Partition which supplies file-like streams whose
 *  fienames are suffixed with a numeric index. Determination of the partition
 *  boundary is still externally defined.
 */
module.exports = function (options) {
  options = options || {}

  if (typeof options.backendOpts !== 'object') {
    throw Error('options.backendOpts must be an object')
  }

  if (typeof options.baseName !== 'string') {
    throw Error('options.baseName must be a string')
  }

  if (typeof options.bound !== 'function') {
    throw Error('options.bound must be a function')
  }

  if (!['fs', 's3', 'kafka'].includes(options.backendOpts.type)) {
    throw Error('options.backendOpts.type must be one of [s3,fs,kafka]')
  }

  const backend = require('kpipe-core').Writer(options.backendOpts)
  const baseName = options.baseName

  // Currently hardcoded to left pad with zeros up to 5 digits
  const digits = (i) => i > 99999 ? `${i}` : '0'.repeat(5 - Math.log10(Math.max(i, 2))) + i

  return Partition({
    bound: options.bound,
    stream: (index) => backend(baseName + digits(index))
  })
}
