const { Readable, Transform } = require('stream')
const ppipe = require('util').promisify(require('stream').pipeline)

test('transform/delineate splits strings on newlines', async () => {
  const string = `Long string with
some newlines embedded. Perhaps a
lengthy paragraph or other some such
thing that needs to be split on newline
boundaries.`

  const stream = new Readable({
    objectMode: false,
    read: () => {}
  })
  stream.push(string)
  stream.push(null)

  const lines = []

  await ppipe(
    stream,
    require('..').Transform.Delineate(),
    new Transform({
      objectMode: false,
      transform: (chunk, enc, cb) => {
        lines.push(chunk)
        cb(null, chunk)
      }
    })
  )

  // Should create 5 chunks
  expect(lines.length).toBe(5)

  // Each chunk should be equivalent to string.split('\n')
  const splitStr = string.split('\n')
  lines.map((l, i) => expect(l.toString()).toBe(splitStr[i]))
})

test('transform/lineate adds newlines to string chunks', async () => {
  const strings = [
    'Long string with',
    'some newlines embedded. Perhaps a',
    'lengthy paragraph or other some such',
    'thing that needs to be split on newline',
    'boundaries.'
  ]

  const stream = new Readable({
    objectMode: true, // lineate takes an object mdoe stream
    read: () => {}
  })
  strings.map((s) => stream.push(s))
  stream.push(null)

  const lines = []

  await ppipe(
    stream,
    require('..').Transform.Lineate(),
    new Transform({
      objectMode: false,
      transform: (chunk, enc, cb) => {
        lines.push(chunk)
        cb(null, chunk)
      }
    })
  )

  // Should create 5 chunks
  expect(lines.length).toBe(5)

  // Each chunk should be equivalent to strings[n] + '\n'
  lines.map((l, i) => expect(l.toString()).toBe(strings[i] + '\n'))
})

test('transform/jsonparse converts json strings to objects', async () => {
  const json = '{"param":"a","array":[1,2,3,4,5],"object":{"a":1,"b":2}}'
  const stream = new Readable({
    objectMode: false,
    read: () => {}
  })
  stream.push(json)
  stream.push(null)

  let obj = {}

  await ppipe(
    stream,
    require('..').Transform.JSONParse(),
    new Transform({
      objectMode: true,
      transform: (chunk, enc, cb) => {
        obj = chunk
        cb(null, chunk)
      }
    })
  )

  expect(typeof obj).toBe('object')
  expect(Array.isArray(obj.array)).toBeTruthy()
  expect(JSON.stringify(obj)).toBe(json)
})

test('transform/jsonstringify converts objects to json strings', async () => {
  const obj = {param:'a',array:[1,2,3,4,5],object:{a:1,b:2}}
  const stream = new Readable({
    objectMode: true,
    read: () => {}
  })
  stream.push(obj)
  stream.push(null)

  let json = ''

  await ppipe(
    stream,
    require('..').Transform.JSONStringify(),
    new Transform({
      objectMode: false,
      transform: (chunk, enc, cb) => {
        if (chunk) {
          json = chunk
        }
        cb(null, chunk)
      }
    })
  )

  expect(Buffer.isBuffer(json)).toBeTruthy()
  expect(Array.isArray(obj.array)).toBeTruthy()
  expect(JSON.stringify(obj)).toBe(json.toString())
})

test('transform/compact reduces an object to an unnamed array', async () => {
  const obj = {param:'a',array:[1,2,3,4,5],object:{a:1,b:2}}
  const stream = new Readable({
    objectMode: true,
    read: () => {}
  })
  stream.push(obj)
  stream.push(null)

  let compact = []

  await ppipe(
    stream,
    require('..').Transform.Compact(),
    new Transform({
      objectMode: true,
      transform: (chunk, enc, cb) => {
        compact = chunk
        cb(null, chunk)
      }
    })
  )

  expect(Array.isArray(compact)).toBeTruthy()
  expect(JSON.stringify(['a',[1,2,3,4,5],[1,2]])).toBe(JSON.stringify(compact))
})

test('transform/value returns message.value as a string', async () => {
  const value = '{"param":"a","array":[1,2,3,4,5],"object":{"a":1,"b":2}}'
  const message = { 
    key: Buffer.from('somekey'), 
    value: Buffer.from(value) 
  }
  const stream = new Readable({
    objectMode: true,
    read: () => {}
  })
  stream.push(message)
  stream.push(null)

  let val = ''

  await ppipe(
    stream,
    require('..').Transform.Value(),
    new Transform({
      objectMode: true,
      transform: (chunk, enc, cb) => {
        val = chunk
        cb(null, chunk)
      }
    })
  )

  expect(typeof val).toBe('string')
  expect(value === val).toBeTruthy()
})