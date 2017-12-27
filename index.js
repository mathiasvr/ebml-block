var BufferReader = require('./lib/buffer-reader')

var XIPH_LACING = 1
var EBML_LACING = 3
var FIXED_SIZE_LACING = 2

module.exports = function (buffer) {
  var block = {}
  var reader = new BufferReader(buffer)

  block.trackNumber = reader.nextUIntV()
  block.timecode = reader.nextInt16BE()

  var flags = reader.nextUInt8()

  block.invisible = !!(flags & 0x8)

  // only valid for SimpleBlock
  block.keyframe = !!(flags & 0x80)
  block.discardable = !!(flags & 0x1)

  var lacing = (flags & 0x6) >> 1

  block.frames = readLacedData(reader, lacing)

  return block
}

function readLacedData (reader, lacing) {
  if (!lacing) return [reader.nextBuffer()]

  var i, frameSize
  var frames = []
  var framesNum = reader.nextUInt8() + 1 // number of frames

  if (lacing === FIXED_SIZE_LACING) {
    // remaining data should be divisible by the number of frames
    if (reader.length % framesNum !== 0) throw new Error('Fixed-Size Lacing Error')

    frameSize = reader.length / framesNum
    for (i = 0; i < framesNum; i++) {
      frames.push(reader.nextBuffer(frameSize))
    }
    return frames
  }

  var frameSizes = []

  if (lacing === XIPH_LACING) {
    for (i = 0; i < framesNum - 1; i++) {
      var val
      frameSize = 0
      do {
        val = reader.nextUInt8()
        frameSize += val
      } while (val === 0xff)
      frameSizes.push(frameSize)
    }
  } else if (lacing === EBML_LACING) {
    // first frame
    frameSize = reader.nextUIntV()
    frameSizes.push(frameSize)

    // middle frames
    for (i = 1; i < framesNum - 1; i++) {
      frameSize += reader.nextIntV()
      frameSizes.push(frameSize)
    }
  }

  for (i = 0; i < framesNum - 1; i++) {
    frames.push(reader.nextBuffer(frameSizes[i]))
  }

  // last frame (remaining buffer)
  frames.push(reader.nextBuffer())

  return frames
}
