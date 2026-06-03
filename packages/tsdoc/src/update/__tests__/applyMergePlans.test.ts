import { describe, expect, test } from 'vitest'
import { Effect } from 'effect'

import { applyMergePlan, applyMergePlans } from '../applyMergePlan.js'

const createFileResult = (symbolId: string, existingJsDoc?: any): any => ({
  analysis: {
    path: 'test.ts',
    exports: [
      {
        symbol: {
          id: symbolId,
          identity: {
            symbolId,
            signatureId: '() => void',
          },
        },
      },
    ],
  },
  metadata: {
    parsedJsDocs: new Map(existingJsDoc ? [[symbolId, existingJsDoc]] : []),
  },
})

describe('applyMergePlan', () => {
  test('replaces summary', async () => {
    const result = await Effect.runPromise(
      applyMergePlan(
        createFileResult('add', {
          summary: 'Old summary',
          params: [],
          tags: [],
        }),
        {
          target: {
            symbolId: 'add',
            signatureId: '() => void',
          },

          summary: {
            type: 'replace',
            value: 'New summary',
          },

          params: [],
          tags: [],

          returns: {
            type: 'preserve',
          },
        } as any,
      ),
    )

    expect(result.summary).toBe('New summary')
  })
  test('deletes returns', async () => {
    const result = await Effect.runPromise(
      applyMergePlan(
        createFileResult('add', {
          params: [],
          tags: [],
          returns: {
            description: 'Return value',
          },
        }),
        {
          target: {
            symbolId: 'add',
            signatureId: '() => void',
          },

          summary: {
            type: 'preserve',
          },

          params: [],
          tags: [],

          returns: {
            type: 'delete',
          },
        } as any,
      ),
    )

    expect(result.returns).toBeUndefined()
  })
  test('adds parameter', async () => {
    const result = await Effect.runPromise(
      applyMergePlan(
        createFileResult('add', {
          params: [],
          tags: [],
        }),
        {
          target: {
            symbolId: 'add',
            signatureId: '() => void',
          },

          summary: {
            type: 'preserve',
          },

          params: [
            {
              name: 'id',
              sortOrder: 1,
              action: {
                type: 'replace',
                value: {
                  type: 'string',
                  description: 'User id',
                },
              },
            },
          ],

          tags: [],

          returns: {
            type: 'preserve',
          },
        } as any,
      ),
    )

    expect(result.params).toEqual([
      {
        name: 'id',
        sortOrder: 1,
        type: 'string',
        description: 'User id',
      },
    ])
  })
  test('replaces tag', async () => {
    const result = await Effect.runPromise(
      applyMergePlan(
        createFileResult('add', {
          params: [],
          tags: [
            {
              tagName: 'throws',
              key: 'ValidationError',
              sortOrder: 1,
              text: 'Old text',
            },
          ],
        }),
        {
          target: {
            symbolId: 'add',
            signatureId: '() => void',
          },

          summary: {
            type: 'preserve',
          },

          params: [],

          tags: [
            {
              tag: {
                kind: 'throws',
                key: 'ValidationError',
              },
              sortOrder: 1,
              action: {
                type: 'replace',
                value: 'Updated text',
              },
            },
          ],

          returns: {
            type: 'preserve',
          },
        } as any,
      ),
    )

    expect(result.tags).toEqual([
      {
        tagName: 'throws',
        key: 'ValidationError',
        sortOrder: 1,
        text: 'Updated text',
      },
    ])
  })
  test('fails when symbol does not exist', async () => {
    const exit = await Effect.runPromiseExit(
      applyMergePlan(createFileResult('add'), {
        target: {
          symbolId: 'unknown',
          signatureId: '() => void',
        },
      } as any),
    )

    expect(exit._tag).toBe('Failure')
  })
})
describe('applyMergePlans', () => {
  test('applies multiple plans', async () => {
    const fileResult = {
      analysis: {
        path: 'test.ts',
        exports: [
          {
            symbol: {
              id: 'add',
              identity: {
                symbolId: 'add',
                signatureId: '() => void',
              },
            },
          },
          {
            symbol: {
              id: 'subtract',
              identity: {
                symbolId: 'subtract',
                signatureId: '() => void',
              },
            },
          },
        ],
      },

      metadata: {
        parsedJsDocs: new Map([
          ['add', { summary: 'old add', params: [], tags: [] }],
          ['subtract', { summary: 'old sub', params: [], tags: [] }],
        ]),
      },
    } as any

    const result = await Effect.runPromise(
      applyMergePlans(fileResult, [
        {
          target: {
            symbolId: 'add',
            signatureId: '() => void',
          },
          summary: {
            type: 'replace',
            value: 'new add',
          },
          params: [],
          tags: [],
          returns: {
            type: 'preserve',
          },
        },
        {
          target: {
            symbolId: 'subtract',
            signatureId: '() => void',
          },
          summary: {
            type: 'replace',
            value: 'new sub',
          },
          params: [],
          tags: [],
          returns: {
            type: 'preserve',
          },
        },
      ] as any),
    )

    expect(result).toHaveLength(2)

    expect(result[0]?.target.symbolId).toBe('add')
    expect(result[0]?.jsDoc.summary).toBe('new add')

    expect(result[1]?.target.symbolId).toBe('subtract')
    expect(result[1]?.jsDoc.summary).toBe('new sub')
  })
})
