import { describe, expect, it } from 'vitest'
import { sortAppLoadedConfigArray } from '../layerOrder.js'

describe('sortAppConfigs', () => {
  const createConfig = (
    layer: 'global' | 'user' | 'scope' | 'user-scope',
    source: 'file' | 'runtime',
  ) => ({
    layer,
    source,
    values: {},
  })

  it('sorts non-runtime configs by layer order', () => {
    const configs = [
      createConfig('user-scope', 'file'),
      createConfig('scope', 'file'),
      createConfig('global', 'file'),
      createConfig('user', 'file'),
    ]

    const result = sortAppLoadedConfigArray(configs)

    expect(result.map((c) => c.layer)).toEqual(['global', 'user', 'scope', 'user-scope'])
  })

  it('places runtime configs after all non-runtime configs', () => {
    const configs = [
      createConfig('global', 'runtime'),
      createConfig('scope', 'file'),
      createConfig('user', 'runtime'),
      createConfig('global', 'file'),
    ]

    const result = sortAppLoadedConfigArray(configs)

    expect(
      result.map((c) => ({
        layer: c.layer,
        source: c.source,
      })),
    ).toEqual([
      { layer: 'global', source: 'file' },
      { layer: 'scope', source: 'file' },
      { layer: 'global', source: 'runtime' },
      { layer: 'user', source: 'runtime' },
    ])
  })

  it('sorts runtime configs by layer order as well', () => {
    const configs = [
      createConfig('user-scope', 'runtime'),
      createConfig('global', 'runtime'),
      createConfig('scope', 'runtime'),
      createConfig('user', 'runtime'),
    ]

    const result = sortAppLoadedConfigArray(configs)

    expect(result.map((c) => c.layer)).toEqual(['global', 'user', 'scope', 'user-scope'])
  })

  it('does not mutate the original array', () => {
    const configs = [createConfig('user', 'file'), createConfig('global', 'file')]

    const original = [...configs]

    sortAppLoadedConfigArray(configs)

    expect(configs).toEqual(original)
  })
})
