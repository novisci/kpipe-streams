module.exports = {
  Observe: require('./observe'),
  Transform: require('./transform'),
  Switch: require('./multiplex/switch'),
  Partition: require('./multiplex/partition'),
  PartSequence: require('./multiplex/partsequence')
}
