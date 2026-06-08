import { describe, expect, it } from 'vitest'
import { toIdentityKey } from '../../analysis/symbol/SymbolAnalysis.js'
import { buildFileUpdatePlan } from '../buildFileUpdatePlan.js'
import type { RenderedSymbolJsDoc } from '../jsdoc/RenderedSymbolJsDoc.js'

describe('buildFileUpdatePlan', () => {
  it('should create edit plan from matching symbols', () => {
    const symbol = {
      identity: {
        symbolId: 'user',
        signatureId: 'sig1',
      },
      location: {
        startLine: 10,
        endLine: 20,
      },
    }

    const sourceFile = {
      analysis: {
        symbols: new Map([[toIdentityKey(symbol.identity), symbol]]),
      },
      metadata: {
        symbols: new Map([[toIdentityKey(symbol.identity), { analysis: symbol }]]),
      },
    }

    const updatedDocs = [
      {
        target: symbol.identity,
        jsDoc: '/** updated */',
        startOffset: 10,
        endOffset: 12,
      },
    ]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = buildFileUpdatePlan(sourceFile as any, updatedDocs as any)

    expect(result).toEqual({
      edits: [
        {
          startLine: 10,
          endLine: 20,
          startOffset: 10,
          endOffset: 12,
          symbol: symbol.identity,
          newText: '/** updated */',
        },
      ],
    })
  })

  it('should ignore docs that do not have matching symbols', () => {
    const sourceFile = {
      analysis: {
        symbols: new Map(),
      },
      metadata: {
        symbols: new Map(),
      },
    }

    const updatedDocs = [
      {
        target: {
          symbolId: 'missing',
          signatureId: 'sig1',
        },
        jsDoc: '/** updated */',
      },
    ]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = buildFileUpdatePlan(sourceFile as any, updatedDocs as any)

    expect(result).toEqual({
      edits: [],
    })
  })

  it('should sort edits by startLine descending', () => {
    const symbol1 = {
      identity: {
        symbolId: 'first',
        signatureId: 'sig1',
      },
      location: {
        startLine: 10,
        endLine: 15,
      },
    }

    const symbol2 = {
      identity: {
        symbolId: 'second',
        signatureId: 'sig2',
      },
      location: {
        startLine: 50,
        endLine: 60,
      },
    }

    const sourceFile = {
      analysis: {
        symbols: new Map([
          [toIdentityKey(symbol1.identity), symbol1],
          [toIdentityKey(symbol2.identity), symbol2],
        ]),
      },
      metadata: {
        symbols: new Map([
          [toIdentityKey(symbol1.identity), { analysis: symbol1 }],
          [toIdentityKey(symbol2.identity), { analysis: symbol2 }],
        ]),
      },
    }

    const updatedDocs = [
      {
        target: symbol1.identity,
        jsDoc: '/** first */',
        startOffset: 10,
        endOffset: 12,
      } as RenderedSymbolJsDoc,
      {
        target: symbol2.identity,
        jsDoc: '/** second */',
        startOffset: 10,
        endOffset: 12,
      } as RenderedSymbolJsDoc,
    ]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = buildFileUpdatePlan(sourceFile as any, updatedDocs as any)

    expect(result.edits).toEqual([
      {
        startLine: 50,
        endLine: 60,
        startOffset: 10,
        endOffset: 12,
        symbol: symbol2.identity,
        newText: '/** second */',
      },
      {
        startLine: 10,
        endLine: 15,
        startOffset: 10,
        endOffset: 12,
        symbol: symbol1.identity,
        newText: '/** first */',
      },
    ])
  })
})
