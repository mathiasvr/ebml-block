const assert = require('assert')
const BufferReader = require('./lib/buffer-reader')

const XIPH_LACING = 1
const EBML_LACING = 3
const FIXED_SIZE_LACING = 2

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

  // number of frames
  var framesNum = reader.nextUInt8() + 1
  var frameSizes = []

  if (lacing === XIPH_LACING) {
    for (let i = 0; i < framesNum - 1; i++) {
      var val
      let frameSize = 0
      do {
        val = reader.nextUInt8()
        frameSize += val
      } while (val === 0xff)
      frameSizes.push(frameSize)
    }
  } else if (lacing === EBML_LACING) {
    // first frame
    let frameSize = reader.nextUIntV()
    frameSizes.push(frameSize)

    // middle frames
    for (let i = 1; i < framesNum - 1; i++) {
      frameSize += reader.nextIntV()
      frameSizes.push(frameSize)
    }
  } else if (lacing === FIXED_SIZE_LACING) {
    let frameSize = reader.length / framesNum

    assert.equal(frameSize % 1, 0)

    // TODO: we don't have to use frameSizes for this
    // when more stable, and assertions are moved, just create the frames directly and return
    for (let i = 0; i < framesNum - 1; i++) {
      frameSizes.push(frameSize)
    }
  }

  assert(lacing < 4)

  var dataSize = reader.length // TODO: not needed

  var frames = []

  // TODO: maybe we should leave frame splitting to dev?
  for (let i = 0; i < framesNum - 1; i++) {
    var frame = reader.nextBuffer(frameSizes[i])
    frames.push(frame)
  }

  // last frame (remaining buffer)
  frames.push(reader.nextBuffer())

  // TODO: move all assertions to test? somehow
  assert.equal(frames.map(a => a.length).reduce((a, b) => a + b), dataSize)

  assert.equal(reader.length, 0)

  assert.equal(frames.length, framesNum)

  return frames
}
