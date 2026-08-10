import { describe, expect, it } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { analyzeProtectedSection } from '../analyzeProtectedSection.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

const createIdentity = (name: string): SymbolIdentity => ({
  signatureId: SignatureId(`signature:${name}`),
  symbolId: SymbolId(name),
})

const createFileResult = (
  symbols: Array<{
    identity: SymbolIdentity
    parsedJsDoc?: Array<{
      protectedSections: Array<unknown>
    }>
  }>,
): FileAnalysisContext =>
  ({
    metadata: {
      symbols: new Map(
        symbols.map((symbol, index) => [
          `symbol-${index}`,
          {
            analysis: {
              identity: symbol.identity,
              parsedJsDoc: symbol.parsedJsDoc,
            },
          },
        ]),
      ),
    },
  }) as any as FileAnalysisContext

describe('analyzeProtectedSection', () => {
  it('returns an empty array when no symbols exist', () => {
    const fileResult = createFileResult([])

    expect(analyzeProtectedSection(fileResult)).toEqual([])
  })

  it('ignores symbols without parsed JSDoc', () => {
    const identity = createIdentity('User')

    const fileResult = createFileResult([
      {
        identity,
      },
    ])

    expect(analyzeProtectedSection(fileResult)).toEqual([])
  })

  it('ignores JSDoc without protected sections', () => {
    const identity = createIdentity('User')

    const fileResult = createFileResult([
      {
        identity,
        parsedJsDoc: [
          {
            protectedSections: [],
          },
        ],
      },
    ])

    expect(analyzeProtectedSection(fileResult)).toEqual([])
  })

  it('returns protected sections for a symbol', () => {
    const identity = createIdentity('User')

    const section = {
      targetSection: 'summary',
      content: 'This section is protected',
    }

    const fileResult = createFileResult([
      {
        identity,
        parsedJsDoc: [
          {
            protectedSections: [section],
          },
        ],
      },
    ])

    expect(analyzeProtectedSection(fileResult)).toEqual([
      {
        identity,
        protectedSections: [section],
      },
    ])
  })

  it('combines protected sections from multiple JSDoc entries', () => {
    const identity = createIdentity('User')

    const summarySection = {
      targetSection: 'summary',
      content: 'Protected summary',
    }

    const returnsSection = {
      targetSection: 'returns',
      content: 'Protected return description',
    }

    const fileResult = createFileResult([
      {
        identity,
        parsedJsDoc: [
          {
            protectedSections: [summarySection],
          },
          {
            protectedSections: [returnsSection],
          },
        ],
      },
    ])

    expect(analyzeProtectedSection(fileResult)).toEqual([
      {
        identity,
        protectedSections: [summarySection, returnsSection],
      },
    ])
  })

  it('ignores empty protected sections while keeping non-empty sections', () => {
    const identity = createIdentity('User')

    const section = {
      targetSection: 'summary',
      content: 'Protected summary',
    }

    const fileResult = createFileResult([
      {
        identity,
        parsedJsDoc: [
          {
            protectedSections: [],
          },
          {
            protectedSections: [section],
          },
        ],
      },
    ])

    expect(analyzeProtectedSection(fileResult)).toEqual([
      {
        identity,
        protectedSections: [section],
      },
    ])
  })

  it('returns protected sections for multiple symbols', () => {
    const userIdentity = createIdentity('User')
    const serviceIdentity = createIdentity('Service')

    const userSection = {
      targetSection: 'summary',
      content: 'Protected User summary',
    }

    const serviceSection = {
      targetSection: 'returns',
      content: 'Protected Service return',
    }

    const fileResult = createFileResult([
      {
        identity: userIdentity,
        parsedJsDoc: [
          {
            protectedSections: [userSection],
          },
        ],
      },
      {
        identity: serviceIdentity,
        parsedJsDoc: [
          {
            protectedSections: [serviceSection],
          },
        ],
      },
    ])

    expect(analyzeProtectedSection(fileResult)).toEqual([
      {
        identity: userIdentity,
        protectedSections: [userSection],
      },
      {
        identity: serviceIdentity,
        protectedSections: [serviceSection],
      },
    ])
  })

  it('ignores symbols with only empty protected sections', () => {
    const protectedIdentity = createIdentity('Protected')
    const unprotectedIdentity = createIdentity('Unprotected')

    const section = {
      targetSection: 'summary',
      content: 'Protected summary',
    }

    const fileResult = createFileResult([
      {
        identity: protectedIdentity,
        parsedJsDoc: [
          {
            protectedSections: [section],
          },
        ],
      },
      {
        identity: unprotectedIdentity,
        parsedJsDoc: [
          {
            protectedSections: [],
          },
        ],
      },
    ])

    expect(analyzeProtectedSection(fileResult)).toEqual([
      {
        identity: protectedIdentity,
        protectedSections: [section],
      },
    ])
  })
})
