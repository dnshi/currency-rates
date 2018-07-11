const utils = require('cli-table3/src/utils')
const stringz = require('stringz')

function codeRegex() {
  return /\u001b\[(?:\d*;){0,5}\d*m/g // eslint-disable-line
}

function strlen(str) {
  const code = codeRegex()
  const stripped = `${str}`.replace(code, '')
  const split = stripped.split('\n')
  return split.reduce(
    (memo, s) => (stringz.length(s) > memo ? stringz.length(s) : memo),
    0
  )
}

function repeat(str, times) {
  return Array(times + 1).join(str)
}

function toPad(str, len, pad) {
  const padlen = len - strlen(str)
  return str + repeat(pad, padlen)
}

utils.pad = toPad
