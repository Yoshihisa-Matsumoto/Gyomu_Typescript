import { describe, expect, it } from 'vitest'
import { overrideMerge } from '../overrideMerge.js'

describe('overrideMerge', () => {
  it('merges properties from next into current', () => {
    const current = { a: 1, b: 2 }
    const next = { b: 3, c: 4 }

    const result = overrideMerge(current, next)

    expect(result).toEqual({
      a: 1,
      b: 3,
      c: 4,
    })
  })
  it('ignores undefined values', () => {
    const current = { a: 1, b: 2 }
    const next = { b: undefined, c: 3 }

    const result = overrideMerge(current, next as any)

    expect(result).toEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })
})
