import { describe, expect, it } from 'vitest'
import { normalizeLogValue } from '../pinoLogger'

describe('normalizeLogValue', () => {
  it('converts Map to object', () => {
    const value = new Map([
      ['global', '/tmp/global.json'],
      ['user', '/tmp/user.json'],
    ])

    expect(normalizeLogValue(value)).toEqual({
      global: '/tmp/global.json',
      user: '/tmp/user.json',
    })
  })

  it('converts nested map', () => {
    const value = {
      paths: new Map([['global', '/tmp/global.json']]),
    }

    expect(normalizeLogValue(value)).toEqual({
      paths: {
        global: '/tmp/global.json',
      },
    })
  })

  it('converts Set to array', () => {
    expect(normalizeLogValue(new Set(['a', 'b']))).toEqual(['a', 'b'])
  })
})
