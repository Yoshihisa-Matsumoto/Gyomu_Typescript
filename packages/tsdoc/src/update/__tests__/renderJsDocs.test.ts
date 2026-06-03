import { describe, expect, it } from 'vitest'
import { renderJsDocs } from '../renderJsDoc.js'

describe('renderJsDocs', () => {
  it('returns empty array', () => {
    expect(renderJsDocs([])).toEqual([])
  })

  it('renders multiple jsdocs', () => {
    const result = renderJsDocs([
      {
        target: 'a',
        jsDoc: {
          summary: 'A',
          examples: [],
          protectedRegions: [],
          params: [],
          returns: undefined,
          throws: [],
          templates: [],
          tags: [],
        },
      },
      {
        target: 'b',
        jsDoc: {
          summary: 'B',
          examples: [],
          protectedRegions: [],
          params: [],
          returns: undefined,
          throws: [],
          templates: [],
          tags: [],
        },
      },
    ] as never)

    expect(result).toHaveLength(2)

    expect(result[0]?.target).toBe('a')
    expect(result[1]?.target).toBe('b')
  })
})
