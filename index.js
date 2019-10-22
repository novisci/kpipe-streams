module.exports = {
  Transform: require('./transform'),
  Switch: require('./multiplex/switch'),
  Partition: require('./multiplex/partition'),
  PartSequence: require('./multiplex/partsequence')
}
