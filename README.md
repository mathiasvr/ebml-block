# ebml-block [![npm][npm-img]][npm-url] [![dependencies][dep-img]][dep-url] [![license][lic-img]][lic-url]

[npm-img]: https://img.shields.io/npm/v/ebml-block.svg
[npm-url]: https://www.npmjs.com/package/ebml-block
[dep-img]: https://david-dm.org/mathiasvr/ebml-block.svg
[dep-url]: https://david-dm.org/mathiasvr/ebml-block
[lic-img]: http://img.shields.io/:license-MIT-blue.svg
[lic-url]: http://mvr.mit-license.org

EBML Block Parser.

Reads a buffer as a [EBML Block Structure](https://www.matroska.org/technical/specs/index.html#block_structure), supporting lacing.

## install

```
npm install ebml-block
```

## example

```javascript
const fs = require('fs')
const ebml = require('ebml')
const ebmlBlock = require('ebml-block')

var decoder = new ebml.Decoder()

decoder.on('data', function (chunk) {
  if (chunk[1].name === 'Block' || chunk[1].name === 'SimpleBlock') {
    var block = ebmlBlock(chunk[1].data)
    console.log(block)
  }
})

fs.createReadStream('media.mkv').pipe(decoder)
```

### output format
```
{ trackNumber: 1,
  timecode: 542,
  invisible: false,
  keyframe: false,
  discardable: true,
  frames: [ 
    <Buffer b4 64 1f 0e  ... > 
    <Buffer b4 64 1f 0c  ... > ] }
```

## license

MIT
