// https://github.com/themasch/node-ebml/blob/master/lib/ebml/tools.js
module.exports = function (buffer, start, signed) {
  start = start || 0
  for (var length = 1; length <= 8; length++) {
    if (buffer[start] >= Math.pow(2, 8 - length)) {
      break
    }
  }
  if (length > 8) {
    throw new Error('Unrepresentable length: ' + length + ' ' +
      buffer.toString('hex', start, start + length))
  }
  if (start + length > buffer.length) {
    return null
  }
  var i
  var value = buffer[start] & (1 << (8 - length)) - 1
  for (i = 1; i < length; i++) {
    if (i === 7) {
      if (value >= Math.pow(2, 53 - 8) && buffer[start + 7] > 0) {
        return {
          length: length,
          value: -1
        }
      }
    }
    value *= Math.pow(2, 8)
    value += buffer[start + i]
  }
  if (signed) {
    value -= Math.pow(2, length * 7 - 1) - 1
  }
  return {
    length: length,
    value: value
  }
}
