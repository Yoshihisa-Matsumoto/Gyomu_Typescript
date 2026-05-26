import { describe, expect, it, vi } from 'vitest'

import { mergeSources } from '../mergeSources.js'

describe('mergeSources', () => {
  it('merges using overrideMerge when no strategy is provided', () => {
    const request = {
      defaultConfig: { a: 1 },
    } as any

    const configs = [{ b: 2 }, { c: 3 }] as any

    const result = mergeSources(request, configs)

    expect(result).toEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })

  it('uses custom mergeStrategy when provided', () => {
    const mergeStrategy = vi.fn((acc, curr) => ({
      ...acc,
      ...curr,
      merged: true,
    }))

    const request = {
      defaultConfig: { a: 1 },
      mergeStrategy,
    } as any

    const configs = [{ b: 2 }, { c: 3 }] as any

    const result = mergeSources(request, configs)

    expect(mergeStrategy).toHaveBeenCalledTimes(2)

    expect(result).toEqual({
      a: 1,
      b: 2,
      c: 3,
      merged: true,
    })
  })

  it('applies configs in order', () => {
    const request = {
      defaultConfig: { value: 0 },
    } as any

    const configs = [{ value: 1 }, { value: 2 }, { value: 3 }] as any

    const result = mergeSources(request, configs)

    expect(result).toEqual({
      value: 3,
    })
  })
})
