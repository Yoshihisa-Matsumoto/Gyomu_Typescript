import fs from 'node:fs'
import { expect, test } from 'vitest'
import { base64String2String, string2Base64String } from '../base64.js'
import { decode } from '../decode.js'

test('base64 encode', () => {
  const bin = fs.readFileSync('tests/shiftjis_sample.txt')
  const utf8 = decode(bin, 'shift-jis')
  const encoded = string2Base64String(utf8)

  expect(utf8).toEqual(base64String2String(encoded))
})
