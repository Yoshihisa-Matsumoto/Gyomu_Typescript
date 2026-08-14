import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { equalSymbolIdentity } from '@gyomu/schema/schemas/typescript'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { PlatformLayer } from '@gyomu/infra'
import { analyzeFile } from '../analyzeFile.js'
import { saveFileAnalysis } from '../saveFileAnalysis.js'
import { loadFileAnalysis } from '../loadFileAnalysis.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'

const timeout = 20000

const basicExportFixture = createFixtureProject(path.join('analysis', 'basic-export'))

const exportPatternsFixture = createFixtureProject(path.join('analysis', 'export-patterns'))

const jsDocFixture = createFixtureProject(path.join('analysis', 'jsdoc'))

const importPatternsFixture = createFixtureProject(path.join('analysis', 'import-patterns'))

const tempJsdocProgram = async (sourceFile: string) => {
  const { project, projectRoot, projectName } = jsDocFixture

  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  return await Effect.runPromise(
    Effect.gen(function* () {
      console.log(filePath)
      const analysis = yield* analyzeFile(jsDocFixture, filePath, {
        debugInfo: { verifyIndex: true },
      })
      yield* saveFileAnalysis(jsDocFixture, analysis.analysis)

      const loaded = yield* loadFileAnalysis(jsDocFixture, analysis.analysis.path)

      expect(loaded).toEqual(analysis.analysis)
      return analysis
    }).pipe(Effect.provide(PlatformLayer)),
  )
}

describe('analyzeFile', () => {
  it(
    'extracts exported symbols from basic-export fixture',
    () => {
      const { project, projectRoot, projectName } = basicExportFixture

      const filePath = ProjectRelativePath(path.join('src', 'index.ts'))
      const program = Effect.gen(function* () {
        const result = yield* analyzeFile(basicExportFixture, filePath, {
          debugInfo: { verifyIndex: true },
        })

        expect(result.analysis.exports).toHaveLength(5)

        expect(
          result.analysis.exports
            .filter((e) => e.kind == 'local')
            .map((x) => {
              const symbol = result.analysis.symbols.find((s) =>
                equalSymbolIdentity(s.identity, x.identity),
              )
              return {
                exportedName: x.exportedName,
                kind: symbol?.kind,
              }
            }),
        ).toEqual([
          {
            exportedName: 'add',
            kind: 'function',
          },
          {
            exportedName: 'User',
            kind: 'interface',
          },
          {
            exportedName: 'UserService',
            kind: 'class',
          },
          {
            exportedName: 'UserId',
            kind: 'type',
          },
          {
            exportedName: 'VERSION',
            kind: 'const',
          },
        ])
      })
      Effect.runSync(program)
    },
    timeout,
  )
  it(
    'analyzes export aliases, default exports, re-exports and type-only exports',
    () => {
      const { project, projectRoot, projectName } = exportPatternsFixture

      const filePath = ProjectRelativePath('src/index.ts')

      const program = Effect.gen(function* () {
        const result = yield* analyzeFile(exportPatternsFixture, filePath, {
          debugInfo: { verifyIndex: true },
        })
        // console.dir(result, { depth: null })

        const localExport = result.analysis.exports
          .filter((e) => e.kind == 'local')
          .map((x) => {
            const symbol = result.analysis.symbols.find((s) =>
              equalSymbolIdentity(s.identity, x.identity),
            )
            return {
              exportedName: x.exportedName,
              kind: symbol?.kind,
              symbolName: symbol?.identity.symbolId,
              isDefault: x.isDefault,
              isTypeOnly: x.isTypeOnly,
            }
          })

        // console.dir(localExport, { depth: null })
        const reExport = result.analysis.exports.filter((e) => e.kind == 're-export')
        // console.dir(reExport, { depth: null })
        expect(localExport).toEqual(
          expect.arrayContaining([
            {
              exportedName: 'value',
              symbolName: 'internalValue',
              kind: 'const',
              isDefault: false,
              isTypeOnly: false,
            },

            {
              exportedName: '$default',
              symbolName: 'UserService',
              kind: 'class',
              isDefault: true,
              isTypeOnly: false,
            },
            {
              exportedName: 'VERSION',
              symbolName: 'VERSION',
              kind: 'const',
              isDefault: false,
              isTypeOnly: false,
            },
            {
              exportedName: 'VERSION2',
              symbolName: 'VERSION',
              kind: 'const',
              isDefault: false,
              isTypeOnly: false,
            },
          ]),
        )

        expect(reExport).toEqual(
          expect.arrayContaining([
            {
              kind: 're-export',
              exportAll: false,
              isTypeOnly: true,
              exportedName: 'User',
              moduleSpecifier: './intrnal.js',
            },
            {
              kind: 're-export',
              exportAll: false,
              isTypeOnly: false,
              exportedName: 'foo',
              moduleSpecifier: './intrnal.js',
            },
            {
              kind: 're-export',
              exportAll: false,
              isTypeOnly: false,
              exportedName: 'foo2',
              moduleSpecifier: './intrnal.js',
            },
            {
              kind: 're-export',
              exportAll: false,
              isTypeOnly: false,
              exportedName: 'UserRole',
              moduleSpecifier: './intrnal.js',
            },
          ]),
        )

        expect(reExport).toEqual(
          expect.arrayContaining([
            {
              kind: 're-export',
              exportAll: false,
              isTypeOnly: false,
              exportedName: 'fooAlias',
              moduleSpecifier: './intrnal.js',
            },
            {
              kind: 're-export',
              exportAll: false,
              isTypeOnly: true,
              exportedName: 'UserAlias',
              moduleSpecifier: './intrnal.js',
            },
            {
              kind: 're-export',
              exportAll: true,
              isTypeOnly: false,
              exportedName: '$*',
              moduleSpecifier: './intrnal.js',
            },
            {
              kind: 're-export',
              exportAll: true,
              isTypeOnly: false,
              exportedName: 'Internal',
              moduleSpecifier: './intrnal.js',
            },
          ]),
        )
      })

      Effect.runSync(program)
    },
    timeout,
  )
  it(
    'registers parsed jsdocs into metadata',
    async () => {
      const result = await tempJsdocProgram('generated-simple.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(1)

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const [symbolId, docs] = [...result.metadata.parsedJsDocs.entries()][0]!

      expect(symbolId).toContain('generated-simple.ts')

      expect(docs).toBeDefined()
    },
    timeout,
  )
  it(
    'registers parsed jsdocs by symbol id',
    async () => {
      const result = await tempJsdocProgram('generated-simple.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(1)

      const entries = [...result.metadata.parsedJsDocs.entries()]

      expect(entries).toHaveLength(1)

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const [symbolId, docs] = entries[0]!

      expect(symbolId).toMatch(/generated-simple\.ts::/)

      expect(docs).toBeDefined()
    },
    timeout,
  )
  it(
    'registers multiple symbol jsdocs',
    async () => {
      const result = await tempJsdocProgram('multiple-symbols.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(2)
    },
    timeout,
  )
  describe('analyzeFile/import-patterns', () => {
    it(
      'analyzes import declarations',
      () => {
        const filePath = ProjectRelativePath('src/index.ts')
        const program = Effect.gen(function* () {
          const result = yield* analyzeFile(importPatternsFixture, filePath, {
            debugInfo: { verifyIndex: true },
          })

          expect(result.analysis.imports).toEqual([
            {
              kind: 'default',
              importedName: 'ps',
              isTypeOnly: false,
              localName: 'ps',
              moduleSpecifier: 'node:path',
            },
            {
              kind: 'default',
              moduleSpecifier: './default-value.js',

              importedName: 'DefaultValue',
              localName: 'DefaultValue',
              isTypeOnly: false,
            },

            {
              kind: 'named',
              moduleSpecifier: './types.js',
              importedName: 'VERSION',

              localName: 'VERSION',

              isTypeOnly: false,
            },
            {
              kind: 'named',
              moduleSpecifier: './types.js',
              importedName: 'createUser',

              localName: 'buildUser',

              isTypeOnly: false,
            },

            {
              kind: 'namespace',
              moduleSpecifier: './types.js',

              importedName: 'Types',

              localName: 'Types',
              isTypeOnly: false,
            },
            {
              kind: 'named',
              moduleSpecifier: './types.js',

              importedName: 'User',

              localName: 'User',

              isTypeOnly: true,
            },
            {
              kind: 'named',
              moduleSpecifier: './types.js',
              importedName: 'UserId',

              localName: 'UserId',

              isTypeOnly: true,
            },
          ])
        })
        Effect.runSync(program)
      },
      timeout,
    )
  })
  describe('analyzeFile jsdoc analysis', () => {
    const firstJsDoc = (result: FileAnalysisContext) => {
      const jsDoc = result.metadata.parsedJsDocs.values().next().value

      expect(jsDoc).toBeDefined()

      return jsDoc!
    }
    const firstJsDocAnalysis = (result: FileAnalysisContext) => {
      const analysis = result.analysis.symbols[0]?.jsDoc

      expect(analysis).toBeDefined()

      return analysis!
    }
    describe('ParsedJsDoc', () => {
      it(
        'detects generated marker',
        async () => {
          const result = await tempJsdocProgram('generated-simple.ts')

          const jsDoc = firstJsDoc(result)

          expect(jsDoc.generator).toEqual({
            tool: 'ChatGPT',
            version: '5.5',
            raw: '@GeneratedBy(ChatGPT@5.5)',
          })
        },
        timeout,
      )

      it(
        'detects complex markdown signals',
        async () => {
          const result = await tempJsdocProgram('manual-markdown.ts')

          const jsDoc = firstJsDoc(result)

          expect(jsDoc.humanEditSignals).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'complex-markdown',
              }),
            ]),
          )
        },
        timeout,
      )

      it(
        'detects manual formatting signals',
        async () => {
          const result = await tempJsdocProgram('manual-formatting.ts')

          const jsDoc = firstJsDoc(result)

          expect(jsDoc.humanEditSignals).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'manual-format',
                details: expect.objectContaining({
                  pattern: 'aligned space',
                }),
              }),
              expect.objectContaining({
                type: 'manual-format',
                details: expect.objectContaining({
                  pattern: 'ascii-art',
                }),
              }),
            ]),
          )
        },
        timeout,
      )

      it(
        'detects non generated tags',
        async () => {
          const result = await tempJsdocProgram('non-generated-tags.ts')

          const jsDoc = firstJsDoc(result)

          expect(jsDoc.humanEditSignals).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'non-generated-tag',
              }),
            ]),
          )
        },
        timeout,
      )
      it(
        'detects multiple human edit signals together',
        async () => {
          const result = await tempJsdocProgram('mixed-human-edit.ts')

          const jsDoc = firstJsDoc(result)

          expect(jsDoc.humanEditSignals).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'complex-markdown',
              }),
              expect.objectContaining({
                type: 'manual-format',
              }),
              expect.objectContaining({
                type: 'non-generated-tag',
              }),
            ]),
          )
        },
        timeout,
      )

      it(
        'analyzeFile supports overloaded functions',
        async () => {
          const result = await tempJsdocProgram('overload-function.ts')

          // console.dir(result, { depth: null })

          expect(result.analysis.exports).toHaveLength(3)
          expect(result.metadata.parsedJsDocs.size).toBe(2)
        },
        timeout,
      )
    })
    describe('JsDocAnalysis', () => {
      it(
        'analyzes generated documentation',
        async () => {
          const result = await tempJsdocProgram('generated-simple.ts')

          const analysis = firstJsDocAnalysis(result)

          expect(analysis.exists).toBe(true)
          expect(analysis.hasSummary).toBe(true)

          expect(analysis.generators).toEqual([
            {
              tool: 'ChatGPT',
              version: '5.5',
              raw: '@GeneratedBy(ChatGPT@5.5)',
            },
          ])

          expect(analysis.hasHumanEditedSections).toBe(false)
        },
        timeout,
      )

      it(
        'detects human edited markdown',
        async () => {
          const result = await tempJsdocProgram('manual-markdown.ts')

          const analysis = firstJsDocAnalysis(result)

          expect(analysis.hasHumanEditedSections).toBe(true)
        },
        timeout,
      )

      it(
        'detects human edited custom tags',
        async () => {
          const result = await tempJsdocProgram('non-generated-tags.ts')

          const analysis = firstJsDocAnalysis(result)

          expect(analysis.hasHumanEditedSections).toBe(true)
        },
        timeout,
      )

      it(
        'detects human edited custom tags',
        async () => {
          const result = await tempJsdocProgram('remarks-fixture.ts')

          const analysis = firstJsDocAnalysis(result)

          expect(analysis.hasRemarks).toBe(true)
          expect(analysis.tagCount).toBe(1)
        },
        timeout,
      )
    })
  })
})
