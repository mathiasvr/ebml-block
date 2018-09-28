var vint = require('./vint')

function BufferReader (buffer) {
  this.buffer = buffer
  this.offset = 0
}

// a super limited subset of the node buffer API
BufferReader.prototype.nextInt16BE = function () {
  var value = this.buffer.readInt16BE(this.offset)
  this.offset += 2
  return value
}

BufferReader.prototype.nextUInt8 = function () {
  var value = this.buffer.readUInt8(this.offset)
  this.offset += 1
  return value
}

// EBML variable sized integers
BufferReader.prototype.nextUIntV = function () {
  var v = vint(this.buffer, this.offset)
  this.offset += v.length
  return v.value
}

BufferReader.prototype.nextIntV = function () {
  var v = vint(this.buffer, this.offset, true)
  this.offset += v.length
  return v.value
}

// buffer slice
BufferReader.prototype.nextBuffer = function (length) {
  var buffer = length
    ? this.buffer.slice(this.offset, this.offset + length)
    : this.buffer.slice(this.offset)
  this.offset += length || this.length
  return buffer
}

// remaining bytes to read
Object.defineProperty(BufferReader.prototype, 'length', {
  get: function () { return this.buffer.length - this.offset }
})

module.exports = BufferReader
