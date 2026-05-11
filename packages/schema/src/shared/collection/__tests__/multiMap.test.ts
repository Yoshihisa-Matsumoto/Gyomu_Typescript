import { describe, expect, it } from 'vitest'
import { addToMultiMap, addToNestedMap } from '../multiMap.js'

describe('addToMultiMap', () => {
  it('should create new entry when key does not exist', () => {
    const map = new Map<string, Array<number>>()

    addToMultiMap(map, 'a', 1)

    expect(map.get('a')).toEqual([1])
  })

  it('should push value when key already exists', () => {
    const map = new Map<string, Array<number>>()
    map.set('a', [1])

    addToMultiMap(map, 'a', 2)

    expect(map.get('a')).toEqual([1, 2])
  })

  it('should handle multiple keys independently', () => {
    const map = new Map<string, Array<number>>()

    addToMultiMap(map, 'a', 1)
    addToMultiMap(map, 'b', 2)

    expect(map.get('a')).toEqual([1])
    expect(map.get('b')).toEqual([2])
  })

  it('should accumulate multiple values', () => {
    const map = new Map<string, Array<number>>()

    addToMultiMap(map, 'a', 1)
    addToMultiMap(map, 'a', 2)
    addToMultiMap(map, 'a', 3)

    expect(map.get('a')).toEqual([1, 2, 3])
  })
})

describe('addToNestedMap', () => {
  it('should create single level map', () => {
    const map = new Map()

    addToNestedMap(map, ['a'], 1)

    expect(map.get('a')).toEqual([1])
  })

  it('should create nested structure', () => {
    const map = new Map()

    addToNestedMap(map, ['a', 'b'], 1)

    const level1 = map.get('a')
    const level2 = level1.get('b')

    expect(level2).toEqual([1])
  })

  it('should append to existing nested path', () => {
    const map = new Map()

    addToNestedMap(map, ['a', 'b'], 1)
    addToNestedMap(map, ['a', 'b'], 2)

    const result = map.get('a').get('b')

    expect(result).toEqual([1, 2])
  })

  it('should handle multiple branches', () => {
    const map = new Map()

    addToNestedMap(map, ['a', 'b'], 1)
    addToNestedMap(map, ['a', 'c'], 2)

    expect(map.get('a').get('b')).toEqual([1])
    expect(map.get('a').get('c')).toEqual([2])
  })

  it('should create deep nested structure', () => {
    const map = new Map()

    addToNestedMap(map, ['a', 'b', 'c'], 1)

    const result = map.get('a').get('b').get('c')

    expect(result).toEqual([1])
  })
})

it('should throw or handle empty keys array', () => {
  const map = new Map()

  expect(() => addToNestedMap(map, [], 1)).toThrow()
})
