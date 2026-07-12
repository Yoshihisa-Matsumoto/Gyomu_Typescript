import { describe, expect, test } from 'vitest'
import { SymbolId } from '@gyomu/schema/typescript'
import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { findExportSymbol } from '../findExportSymbol.js'
import { AnalysisError } from '../../error/AnalysisError.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { LocalExportAnalysis } from '@gyomu/schema/schemas/typescript'

describe('findExportSymbol', () => {
  test('returns export symbol', () => {
    const exportItem = {
      identity: {
        symbolId: SymbolId('foo'),
      },
    } as LocalExportAnalysis

    const symbol = {
      kind: 'function',
      identity: {
        symbolId: SymbolId('foo'),
      },
    }

    const context = {
      analysis: {
        path: 'src/test.ts',
      },
      metadata: {
        symbols: new Map([
          [
            toIdentityKey(exportItem.identity),
            {
              analysis: symbol,
            },
          ],
        ]),
      },
    } as any as FileAnalysisContext

    expect(findExportSymbol(context, exportItem)).toBe(symbol)
  })

  test('throws when export symbol is not found', () => {
    const exportItem = {
      identity: {
        symbolId: SymbolId('foo'),
      },
    } as LocalExportAnalysis

    const context = {
      analysis: {
        path: 'src/test.ts',
      },
      metadata: {
        symbols: new Map(),
      },
    } as any as FileAnalysisContext

    expect(() => findExportSymbol(context, exportItem)).toThrow(AnalysisError)

    expect(() => findExportSymbol(context, exportItem)).toThrow('Export Symbol Not found')
  })

  test('throws when analysis is not a SymbolAnalysis', () => {
    const exportItem = {
      identity: {
        symbolId: SymbolId('foo'),
      },
    } as LocalExportAnalysis

    const context = {
      analysis: {
        path: 'src/test.ts',
      },
      metadata: {
        symbols: new Map([
          [
            toIdentityKey(exportItem.identity),
            {
              analysis: {
                kind: 'sourceFile', // isSymbolKind() が false になる種類
              },
            },
          ],
        ]),
      },
    } as any as FileAnalysisContext

    expect(() => findExportSymbol(context, exportItem)).toThrow(AnalysisError)
  })
})
