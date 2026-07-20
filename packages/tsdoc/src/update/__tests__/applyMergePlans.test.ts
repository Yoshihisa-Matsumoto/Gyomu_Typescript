import { describe, expect, test } from 'vitest'
import { Effect } from 'effect'

import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { applyMergePlan, applyMergePlans } from '../applyMergePlan.js'

const createFileResult = (symId: string, existingJsDoc?: any): any => {
  const symbolId = SymbolId(symId)
  return {
    analysis: {
      path: 'test.ts',
      exports: [
        {
          symbol: {
            id: symbolId,
            identity: {
              symbolId,
              signatureId: SignatureId('() => void'),
            },
          },
        },
      ],
    },
    metadata: {
      parsedJsDocs: new Map(existingJsDoc ? [[symbolId, existingJsDoc]] : []),
      symbols: new Map([
        [
          toIdentityKey({
            symbolId,
            signatureId: SignatureId('() => void'),
          }),
          {
            analysis: {
              id: symbolId,
              identity: {
                symbolId,
                signatureId: SignatureId('() => void'),
              },
            },
            indent: '',
          },
        ],
      ]),
    },
  }
}

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
            symbolId: SymbolId('add'),
            signatureId: SignatureId('() => void'),
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

    expect(result.updatedJsDoc.summary).toBe('New summary')
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
            symbolId: SymbolId('add'),
            signatureId: SignatureId('() => void'),
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

    expect(result.updatedJsDoc.returns).toBeUndefined()
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
            symbolId: SymbolId('add'),
            signatureId: SignatureId('() => void'),
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

    expect(result.updatedJsDoc.params).toEqual([
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
            symbolId: SymbolId('add'),
            signatureId: SignatureId('() => void'),
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

    expect(result.updatedJsDoc.tags).toEqual([
      {
        tagName: 'throws',
        // key: 'ValidationError',
        sortOrder: 1,
        text: 'Updated text',
      },
    ])
  })
  test('fails when symbol does not exist', async () => {
    const exit = await Effect.runPromiseExit(
      applyMergePlan(createFileResult('add'), {
        target: {
          symbolId: SymbolId('unknown'),
          signatureId: SignatureId('() => void'),
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
                symbolId: SymbolId('add'),
                signatureId: SignatureId('() => void'),
              },
            },
          },
          {
            symbol: {
              id: 'subtract',
              identity: {
                symbolId: SymbolId('subtract'),
                signatureId: SignatureId('() => void'),
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
        symbols: new Map([
          [
            toIdentityKey({
              symbolId: SymbolId('add'),
              signatureId: SignatureId('() => void'),
            }),
            {
              analysis: {
                id: SymbolId('add'),
                identity: {
                  symbolId: SymbolId('add'),
                  signatureId: SignatureId('() => void'),
                },
              },
              indent: '',
            },
          ],
          [
            toIdentityKey({
              symbolId: SymbolId('subtract'),
              signatureId: SignatureId('() => void'),
            }),
            {
              analysis: {
                id: SymbolId('subtract'),
                identity: {
                  symbolId: SymbolId('subtract'),
                  signatureId: SignatureId('() => void'),
                },
              },
              indent: '',
            },
          ],
        ]),
      },
    } as any

    const result = await Effect.runPromise(
      applyMergePlans(fileResult, [
        {
          target: {
            symbolId: SymbolId('add'),
            signatureId: SignatureId('() => void'),
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
            symbolId: SymbolId('subtract'),
            signatureId: SignatureId('() => void'),
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

    expect(result[0]?.target.symbolId).toBe(SymbolId('add'))
    expect(result[0]?.jsDoc.summary).toBe('new add')

    expect(result[1]?.target.symbolId).toBe(SymbolId('subtract'))
    expect(result[1]?.jsDoc.summary).toBe('new sub')
  })
})
