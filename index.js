#!/usr/bin/env node

/**
 * Author: Dean Shi <dean.xiaoshi@gmail.com>
 * Date:   2018-01-09
 */

const r2 = require('r2')
const Table = require('cli-table2')
const colors = require('colors') // eslint-disable-line
const program = require('commander')

const XE_URL = 'http://www.xe.com/a/ratesprovider.php?_='
const DIVIDER = ','

program
  .version(require('./package.json').version)
  .option('-r, --rows [currency]', `display all currencies to convert on rows (split by ${DIVIDER})`, 'CAD')
  .option('-c, --cols [currency]', `display all currencies to be converted on columns (split by ${DIVIDER})`, 'USD,CNY,EUR,GBP,AUD,JPY')
  .option('-i, --inverse [inverse]', 'inverse currencies to convert', false)
  .option('-l, --list [currency code]', 'show all available currency code', false)
  .parse(process.argv)

const precision = 3
const isInversed = program.inverse
const showList = program.list

init()

async function init() {
  try {
    const { rates } = await r2(XE_URL + +(new Date())).json
    const currencies = JSON.parse(decodeRatesData(rates.minutely))
    const availableCurrencyCode = new Set(Object.keys(currencies))

    const verifyCode = code => availableCurrencyCode.has(code)

    if (showList) {
      delete currencies.timestamp

      console.log(Object.keys(currencies).map(str => str.cyan).join(' '))
    } else {
      const [rows, cols] = [
        program.rows.split(DIVIDER).filter(verifyCode),
        program.cols.split(DIVIDER).filter(verifyCode),
      ]

      const table = new Table({
        head: [isInversed ? 'Inverse'.gray : '', ...cols].map(title => title.yellow),
        colWidths: [9, ...Array(cols.length).fill(10)],
      })

      rows.forEach(row => table.push([`1 ${row}`, ...cols.map(col => convert(currencies[row], currencies[col]))]))

      console.log(table.toString())
    }
  } catch (error) {
    console.error('⚠️  Cannot fetch currency rates'.bold.red)
  }
}

function convert(base, target) {
  if (isInversed) [base, target] = [target, base] // eslint-disable-line
  return (target / base).toFixed(precision)
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
