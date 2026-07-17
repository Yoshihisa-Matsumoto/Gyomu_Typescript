import { describe, expect, test } from 'vitest'
// import { SymbolId } from '@gyomu/schema/typescript'
// import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
// import { buildFilConceptInput } from '../buildFileConceptInput.js'
// import type { LocalExportAnalysis } from '@gyomu/schema/schemas/typescript'
// import type { FileAnalysisContext } from '@gyomu/schema/typescript'

describe('buildFilConceptInput', () => {
  test('')
  // test('builds export summaries', () => {
  //   const exportItem = {
  //     kind: 'local',
  //     identity: {
  //       symbolId: SymbolId('foo'),
  //     },
  //   } as LocalExportAnalysis
  //   const symbol = {
  //     kind: 'function',
  //     identity: {
  //       symbolId: SymbolId('foo'),
  //     },
  //     jsDoc: {
  //       hasSummary: true,
  //     },
  //     parsedJsDoc: [
  //       {
  //         summary: 'Foo summary',
  //       },
  //     ],
  //   }
  //   const context = {
  //     analysis: {
  //       path: 'src/sample.ts',
  //       exports: [exportItem],
  //     },
  //     metadata: {
  //       symbols: new Map([
  //         [
  //           toIdentityKey(exportItem.identity),
  //           {
  //             analysis: symbol,
  //           },
  //         ],
  //       ]),
  //     },
  //   } as any as FileAnalysisContext
  //   expect(buildFilConceptInput(context)).toEqual({
  //     path: 'src/sample.ts',
  //     exports: [
  //       {
  //         kind: 'function',
  //         symbol: SymbolId('foo'),
  //         summary: 'Foo summary',
  //       },
  //     ],
  //   })
  // })
  // test('returns empty summary when jsDoc.hasSummary is false', () => {
  //   const exportItem = {
  //     kind: 'local',
  //     identity: {
  //       symbolId: SymbolId('foo'),
  //     },
  //   } as LocalExportAnalysis
  //   const symbol = {
  //     kind: 'function',
  //     identity: {
  //       symbolId: SymbolId('foo'),
  //     },
  //     jsDoc: {
  //       hasSummary: false,
  //     },
  //     parsedJsDoc: [
  //       {
  //         summary: 'Should not be used',
  //       },
  //     ],
  //   }
  //   const context = {
  //     analysis: {
  //       path: 'src/sample.ts',
  //       exports: [exportItem],
  //     },
  //     metadata: {
  //       symbols: new Map([
  //         [
  //           toIdentityKey(exportItem.identity),
  //           {
  //             analysis: symbol,
  //           },
  //         ],
  //       ]),
  //     },
  //   } as any as FileAnalysisContext
  //   expect(buildFilConceptInput(context).exports).toEqual([
  //     {
  //       kind: 'function',
  //       symbol: SymbolId('foo'),
  //       summary: '',
  //     },
  //   ])
  // })
  // test('returns empty summary when parsedJsDoc is undefined', () => {
  //   const exportItem = {
  //     kind: 'local',
  //     identity: {
  //       symbolId: SymbolId('foo'),
  //     },
  //   } as LocalExportAnalysis
  //   const symbol = {
  //     kind: 'function',
  //     identity: {
  //       symbolId: SymbolId('foo'),
  //     },
  //     jsDoc: {
  //       hasSummary: true,
  //     },
  //     parsedJsDoc: undefined,
  //   }
  //   const context = {
  //     analysis: {
  //       path: 'src/sample.ts',
  //       exports: [exportItem],
  //     },
  //     metadata: {
  //       symbols: new Map([
  //         [
  //           toIdentityKey(exportItem.identity),
  //           {
  //             analysis: symbol,
  //           },
  //         ],
  //       ]),
  //     },
  //   } as any as FileAnalysisContext
  //   expect(buildFilConceptInput(context).exports).toEqual([
  //     {
  //       kind: 'function',
  //       symbol: SymbolId('foo'),
  //       summary: '',
  //     },
  //   ])
  // })
  // test('filters non-local exports', () => {
  //   const context = {
  //     analysis: {
  //       path: 'src/sample.ts',
  //       exports: [
  //         {
  //           kind: 're-export',
  //         },
  //       ],
  //     },
  //     metadata: {
  //       symbols: new Map(),
  //     },
  //   } as any as FileAnalysisContext
  //   expect(buildFilConceptInput(context)).toEqual({
  //     path: 'src/sample.ts',
  //     exports: [],
  //   })
  // })
})
