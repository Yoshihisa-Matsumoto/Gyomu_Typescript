import { describe, expect, test } from 'vitest'
import { SymbolId } from '@gyomu/schema/typescript'
import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { buildFileSummaryRecord } from '../buildFileSummaryRecord.js'
import type { ExportSummary } from '@gyomu/schema/concept'
import type { LocalExportAnalysis } from '@gyomu/schema/schemas/typescript'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'

describe('buildFileSummaryRecord', () => {
  test('builds export summaries', () => {
    const exportItem = {
      kind: 'local',
      identity: {
        symbolId: SymbolId('foo'),
      },
    } as LocalExportAnalysis

    const symbol = {
      kind: 'function',
      identity: {
        symbolId: SymbolId('foo'),
      },
      jsDoc: {
        hasSummary: true,
      },
      parsedJsDoc: [
        {
          summary: 'Foo summary',
        },
      ],
      dependencyCandidates: [],
    }

    const context = {
      analysis: {
        path: 'src/sample.ts',
        exports: [exportItem],
        symbols: [symbol],
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

    expect(buildFileSummaryRecord(context)).toEqual({
      path: 'src/sample.ts',

      dependencies: [],
      exports: [
        {
          kind: 'function',
          symbol: SymbolId('foo'),
          summary: 'Foo summary',
        },
      ],
      reExports: [],
    })
  })

  test('returns empty summary when jsDoc.hasSummary is false', () => {
    const exportItem = {
      kind: 'local',
      identity: {
        symbolId: SymbolId('foo'),
      },
    } as LocalExportAnalysis

    const symbol = {
      kind: 'function',
      identity: {
        symbolId: SymbolId('foo'),
      },
      jsDoc: {
        hasSummary: false,
      },
      parsedJsDoc: [
        {
          summary: 'Should not be used',
        },
      ],
      dependencyCandidates: [],
    }

    const context = {
      analysis: {
        path: 'src/sample.ts',
        exports: [exportItem],
        symbols: [symbol],
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

    expect(buildFileSummaryRecord(context).exports).toEqual([
      {
        kind: 'function',
        symbol: SymbolId('foo'),
        summary: '',
      } satisfies ExportSummary,
    ])
  })

  test('returns empty summary when parsedJsDoc is undefined', () => {
    const exportItem = {
      kind: 'local',
      identity: {
        symbolId: SymbolId('foo'),
      },
    } as LocalExportAnalysis

    const symbol = {
      kind: 'function',
      identity: {
        symbolId: SymbolId('foo'),
      },
      jsDoc: {
        hasSummary: true,
      },
      parsedJsDoc: undefined,
      dependencyCandidates: [],
    }

    const context = {
      analysis: {
        path: 'src/sample.ts',
        exports: [exportItem],
        symbols: [symbol],
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

    expect(buildFileSummaryRecord(context).exports).toEqual([
      {
        kind: 'function',
        symbol: SymbolId('foo'),
        summary: '',
      },
    ])
  })

  test('filters non-local exports', () => {
    const context = {
      analysis: {
        path: 'src/sample.ts',
        exports: [
          {
            kind: 're-export',
            moduleSpecifier: 'module',
            exportedName: 'symbol',
          },
        ],
        symbols: [],
      },
      metadata: {
        symbols: new Map(),
      },
    } as any as FileAnalysisContext

    expect(buildFileSummaryRecord(context)).toEqual({
      path: 'src/sample.ts',
      exports: [],
      dependencies: [],
      reExports: [{ exportAll: false, module: 'module', symbol: 'symbol' }],
    })
  })

  test('builds dependency summaries', () => {
    const context = {
      analysis: {
        path: 'src/sample.ts',
        exports: [],
        imports: [
          {
            localName: 'foo',
            moduleSpecifier: './foo',
          },
          {
            localName: 'bar',
            moduleSpecifier: '@gyomu/core',
          },
        ],
        symbols: [
          {
            dependencyCandidates: [
              {
                target: {
                  scope: 'import',
                  localSymbolName: 'foo',
                },
              },
              {
                target: {
                  scope: 'import',
                  localSymbolName: 'bar',
                },
              },
            ],
          },
        ],
      },
      metadata: {
        symbols: new Map(),
      },
    } as any as FileAnalysisContext

    expect(buildFileSummaryRecord(context).dependencies).toEqual([
      {
        target: 'foo',
        external: false,
      },
      {
        target: 'bar',
        external: true,
      },
    ])
  })
})
