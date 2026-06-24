import { describe, expect, it } from 'vitest'
import { renderJsDocLines } from '../renderJsDocLines.js'

describe('renderJsDocLines', () => {
  it('returns empty array when jsdoc is empty', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        throws: [],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([])
  })

  it('renders summary', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        summary: 'Create user',
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        throws: [],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'text',
        text: 'Create user',
      },
    ])
  })

  it('renders examples', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: ['foo()', 'bar()'],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        throws: [],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@example\nfoo()',
      },
      {
        type: 'blank',
      },
      {
        type: 'tag',
        text: '@example\nbar()',
      },
    ])
  })
  it('renders protected regions sorted by start', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [
          {
            start: 20,
            end: 30,
            content: 'second',
          },
          {
            start: 10,
            end: 15,
            content: 'first',
          },
        ],
        protectedSection: [],
        params: [],
        throws: [],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })
    expect(result).toEqual([
      {
        type: 'text',
        text: 'first',
      },
      {
        type: 'blank',
      },
      {
        type: 'text',
        text: 'second',
      },
    ])
  })
  it('renders params sorted by sortOrder', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [
          {
            name: 'b',
            description: 'param b',
            sortOrder: 2,
          },
          {
            name: 'a',
            description: 'param a',
            sortOrder: 1,
          },
        ],
        throws: [],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@param a param a',
      },
      {
        type: 'blank',
      },
      {
        type: 'tag',
        text: '@param b param b',
      },
    ])
  })
  it('renders param without description', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [
          {
            name: 'id',
            sortOrder: 1,
          },
        ],
        throws: [],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@param id',
      },
    ])
  })
  it('renders returns', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        returns: {
          description: 'Created user',
        },
        throws: [],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@returns Created user',
      },
    ])
  })
  it('renders throws sorted by order', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        throws: [
          {
            description: 'second',
            order: 2,
          },
          {
            description: 'first',
            order: 1,
          },
        ],
        templates: [],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@throws first',
      },
      {
        type: 'blank',
      },
      {
        type: 'tag',
        text: '@throws second',
      },
    ])
  })
  it('renders templates', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        throws: [],
        templates: ['T', 'U'],
        tags: [],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '  ',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@template T',
      },
      {
        type: 'blank',
      },
      {
        type: 'tag',
        text: '@template U',
      },
    ])
  })
  it('renders custom tags', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        throws: [],
        templates: [],
        tags: [
          {
            tagName: 'deprecated',
            text: 'Use createUser',
            sortOrder: 1,
          },
        ],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@deprecated Use createUser',
      },
    ])
  })
  it('renders tag with key', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        examples: [],
        protectedRegions: [],
        protectedSection: [],
        params: [],
        throws: [],
        templates: [],
        tags: [
          {
            tagName: 'see',
            key: 'UserService',
            text: 'Related API',
            sortOrder: 1,
          },
        ],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'tag',
        text: '@see UserService Related API',
      },
    ])
  })
  it('renders complete jsdoc in expected order', () => {
    const result = renderJsDocLines({
      target: {} as never,
      jsDoc: {
        summary: 'Create user',
        examples: ['createUser()'],
        protectedRegions: [
          {
            start: 10,
            end: 20,
            content: 'Protected content',
          },
        ],
        protectedSection: [],
        params: [
          {
            name: 'id',
            description: 'User ID',
            sortOrder: 1,
          },
        ],
        returns: {
          description: 'Created user',
        },
        throws: [
          {
            description: 'Validation error',
            order: 1,
          },
        ],
        templates: ['T'],
        tags: [
          {
            tagName: 'since',
            text: '1.0.0',
            sortOrder: 1,
          },
        ],
        humanEditSignals: [],
        startOffset: 0,
        endOffset: 0,
      },
      indent: '',
    })

    expect(result).toEqual([
      {
        type: 'text',
        text: 'Create user',
      },
      {
        type: 'blank',
      },

      {
        type: 'tag',
        text: '@example\ncreateUser()',
      },
      {
        type: 'blank',
      },

      {
        type: 'text',
        text: 'Protected content',
      },
      {
        type: 'blank',
      },
      {
        type: 'tag',
        text: '@param id User ID',
      },
      {
        type: 'blank',
      },

      {
        type: 'tag',
        text: '@returns Created user',
      },
      {
        type: 'blank',
      },

      {
        type: 'tag',
        text: '@throws Validation error',
      },
      {
        type: 'blank',
      },

      {
        type: 'tag',
        text: '@template T',
      },
      {
        type: 'blank',
      },

      {
        type: 'tag',
        text: '@since 1.0.0',
      },
    ])
  })
})
