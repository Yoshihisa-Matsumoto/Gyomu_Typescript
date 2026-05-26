import { describe, expect, it } from 'vitest'
import { Option } from 'effect'

import { excludeOptionFromRawConfig } from '../excludeOptionFromRawConfig.js'

describe('excludeOptionFromRawConfig', () => {
  it('unwraps Option.some and Option.none', () => {
    const input = {
      a: Option.some('value'),
      b: Option.none(),
    }

    const result = excludeOptionFromRawConfig(input)

    expect(result).toEqual({
      a: 'value',
      b: undefined,
    })
  })
  it('maps arrays recursively', () => {
    const input = {
      list: [Option.some(1), Option.none(), Option.some(3)],
    }

    const result = excludeOptionFromRawConfig(input)

    expect(result).toEqual({
      list: [1, undefined, 3],
    })
  })
  it('handles nested objects', () => {
    const input = {
      nested: {
        a: Option.some('x'),
        b: {
          c: Option.none(),
          d: Option.some(42),
        },
      },
    }

    const result = excludeOptionFromRawConfig(input)

    expect(result).toEqual({
      nested: {
        a: 'x',
        b: {
          c: undefined,
          d: 42,
        },
      },
    })
  })
  it('keeps primitive values unchanged', () => {
    const input = {
      str: 'hello',
      num: 123,
      bool: true,
      nil: null,
    }

    const result = excludeOptionFromRawConfig(input)

    expect(result).toEqual(input)
  })
})
