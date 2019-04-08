#!/usr/bin/env node

/**
 * Author: Dean Shi <dean.xiaoshi@gmail.com>
 * Date:   2018-01-09
 */

require('./helper')
require('colors')

const r2 = require('r2')
const Table = require('cli-table3')
const program = require('commander')
const flag = require('country-code-emoji')

const XE_URL = 'http://www.xe.com/a/ratesprovider.php?_='
const DIVIDER = ','

program
  .version(require('../package.json').version)
  .option(
    '-r, --rows [currency]',
    `set currencies to convert on rows (split by ${DIVIDER})`,
    'USD'
  )
  .option(
    '-c, --cols [currency]',
    `set currencies to be converted on columns (split by ${DIVIDER})`,
    'CAD,CNY,EUR'
  )
  .option('-i, --inverse [currency]', 'inverse currencies to convert', false)
  .option(
    '-l, --list [currency code]',
    'show all available currency code',
    false
  )
  .parse(process.argv)

const precision = 3
const isInversed = program.inverse
const shouldShowList = program.list

r2(XE_URL + +new Date())
  .json.then(({ rates }) => run(rates))
  .catch((error) => {
    console.error('⚠️  Cannot fetch currency rates'.bold.red)
    console.log(error)
  })

function run(rates) {
  const currencies = JSON.parse(decodeRatesData(rates.minutely))
  const currenciesArr = Object.keys(currencies).filter(
    (c) => !c.startsWith('X') && c !== 'timestamp'
  )

  if (shouldShowList) {
    showList(currenciesArr)
  } else {
    printTable(currencies, currenciesArr)
  }
}

function showList(currenciesArr) {
  console.log(
    currenciesArr.map((code) => `${getFlag(code)} ${code.cyan}`).join('')
  )
}

function printTable(currencies, currenciesArr) {
  const currenciesSet = new Set(currenciesArr)
  const [rows, cols] = [
    program.rows.split(DIVIDER).filter(verifyCode(currenciesSet)),
    program.cols.split(DIVIDER).filter(verifyCode(currenciesSet)),
  ]

  const table = new Table({
    head: [isInversed ? 'Inverse'.gray : '', ...cols].map(
      (title) => title.yellow + getFlag(title)
    ),
    colWidths: [10, ...Array(cols.length).fill(9)],
  })

  rows.forEach((row) =>
    table.push([
      `1 ${row + getFlag(row)}`,
      ...cols.map((col) => convert(currencies[row], currencies[col])),
    ])
  )

  console.log(table.toString())
}

function verifyCode(currenciesSet) {
  return (code) => currenciesSet.has(code)
}

function convert(base, target) {
  return (isInversed ? base / target : target / base).toFixed(precision)
}

function getFlag(code) {
  return code && ` ${flag(code.substring(0, 2))}`
}

/* eslint-disable */
function decodeRatesData(c) {
  try {
    var a = c.substr(c.length - 4)
    var f = a.charCodeAt(0) + a.charCodeAt(1) + a.charCodeAt(2) + a.charCodeAt(3)
    f = (c.length - 10) % f
    f = (f > (c.length - 10 - 4)) ? (c.length - 10 - 4) : f
    var l = c.substr(f, 10)
    c = c.substr(0, f) + c.substr(f + 10)
    var c = decode64(decodeURIComponent(c))
    if (c === false) {
      return false
    }
    var m = ''
    var b = 0
    for (var d = 0; d < (c.length); d += 10) {
      var h = c.charAt(d)
      var g = l.charAt(((b % l.length) - 1) < 0 ? (l.length + (b % l.length) - 1) : ((b % l.length) - 1))
      h = String.fromCharCode(h.charCodeAt(0) - g.charCodeAt(0))
      m += (h + c.substring(d + 1, d + 10))
      b++
    }
    return m
  } catch (k) {
    return false
  }
}

function decode64(g) {
  try {
    var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    var b = ''
    var o, m, k = ''
    var n, l, j, h = ''
    var d = 0
    var a = /[^A-Za-z0-9\+\/\=]/g
    if (a.exec(g)) {
      return false
    }
    g = g.replace(/[^A-Za-z0-9\+\/\=]/g, '')
    do {
      n = c.indexOf(g.charAt(d++))
      l = c.indexOf(g.charAt(d++))
      j = c.indexOf(g.charAt(d++))
      h = c.indexOf(g.charAt(d++))
      o = (n << 2) | (l >> 4)
      m = ((l & 15) << 4) | (j >> 2)
      k = ((j & 3) << 6) | h
      b = b + String.fromCharCode(o)
      if (j != 64) {
        b = b + String.fromCharCode(m)
      }
      if (h != 64) {
        b = b + String.fromCharCode(k)
      }
      o = m = k = ''
      n = l = j = h = ''
    } while (d < g.length)
    return unescape(b)
  } catch (f) {
    return false
  }
}
