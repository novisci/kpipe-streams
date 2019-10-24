# `kpipe-streams`

## Stream Types

| Name | Type | Reads | Writes | Notes |
|--|--|--|--|--|--|
| `transform/gunzip` | duplex | buffers | | |
| `transform/delineate` | duplex | buffers | lines | _Split buffer on newlines_ |
| `transform/jsonparse` | duplex | lines | objects | _JSON => object_ |
| `transform/compact` | duplex | objects | objects | _Convert objects to arrays of values_ |
| `transform/head` | duplex | lines | lines | _Only process first N lines_ |
| `transform/progress` | duplex | objects<br/>buffer | objects<br/>buffer | _Emit `.` to stderr for every 10k objects <br/> Emit `.` to stderr for every 10k `\n` (newlines)_ |
| `transform/value` | duplex | objects | lines | _Extract object value property as a string_ |
| `transform/jsonstringify` | duplex | objects | lines | _object => JSON_ |
| `transform/lineate` | duplex | lines | buffers | _Join lines with newlines_ |
| `transform/gzip` | duplex | | buffers | |

> _Lines are strings which are terminated by newlines. Streams operating on lines are assumed to be in object mode. Each chunk is a string (with the terminating newline removed)_

## Structure of data

The main data format transferred by the datapipe functions are assumed to be streaming JSON. That is, the data are organized as parseable JSON objects which are contained in a single line (non-prettified). Newlines in the stream mark the end of each JSON object. In this way, data may be streamed line by line as a string when simply transferring data, but can be parsed into a object when required.

Though some stream functions are agnostic to the underlying structure of the stream, the interpretation of the stream as topic events assumes particular structure, which can be one of the following:

### Object form

The event is serialized as a JSON object. If the object contains a property `key` at the root, then its value is used as a the topic key for a produced event.

```
{"prop1":"value1","key":"1","prop2":"value1_detail","prop3":["a","nested","array"]}
```

### Array form

The event is serialized as a JSON array. In this format, the values are distinguised by their order in the array. When this format is used, the first element of the array is assumed to be the topic key. (Un-keyed data should contain a `null` in the first element position)

```
["1","value1","value1_detail",["a","nested","array"],{"a":"nested","b":"object"}]
```

## Examples

> A note about IO: `stdout` is reserved for transmission of data. All messaging, status, and progress output is emitted to `stderr`

```
// Read from S3 and write to stdout
require('stream').pipeline(
    new (require('./reader))({ 
      type: 's3',
      region: 'us-east-1',
      bucket: 'a-bucket'
    })('path/to/object'),
    new (require('./writer'))({ type: 'stdio' })(),
    (err) => {
      if (err) {
        console.error(err)
        process.exit(-1)
      }
    }
  )
```
