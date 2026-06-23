import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { FileAnalysisResult } from '../file/FileAnalysisResult.js'

const timeout = 20000

const basicExportFixture = createFixtureProject(path.join('analysis', 'basic-export'))

const exportPatternsFixture = createFixtureProject(path.join('analysis', 'export-patterns'))

const jsDocFixture = createFixtureProject(path.join('analysis', 'jsdoc'))

const importPatternsFixture = createFixtureProject(path.join('analysis', 'import-patterns'))

const tempJsdocProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = jsDocFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  return Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(jsDocFixture, filePath, {
        includeDebugInfo: true,
      })
    }),
  )
}

describe('analyzeFile', () => {
  it(
    'extracts exported symbols from basic-export fixture',
    () => {
      const { project, projectRoot, projectName } = basicExportFixture

      const filePath = path.join(projectRoot, path.join('src', 'index.ts'))
      const program = Effect.gen(function* () {
        const result = yield* analyzeFile(basicExportFixture, filePath)

        expect(result.analysis.exports).toHaveLength(5)

        expect(
          result.analysis.exports.map((x) => ({
            exportedName: x.exportedName,
            kind: x.symbol.kind,
          })),
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

      const filePath = path.join(projectRoot, 'src/index.ts')

      const program = Effect.gen(function* () {
        const result = yield* analyzeFile(exportPatternsFixture, filePath)
        console.dir(result, { depth: null })
        expect(
          result.analysis.exports.map((x) => ({
            exportedName: x.exportedName,
            kind: x.symbol.kind,
            symbolName: x.symbol.identity.symbolId,
            isDefault: x.isDefault,
            isTypeOnly: x.isTypeOnly,
          })),
        ).toMatchObject([
          {
            exportedName: 'value',
            symbolName: 'internalValue',
            kind: 'const',
            isDefault: false,
            isTypeOnly: false,
          },

          {
            exportedName: 'default',
            symbolName: 'UserService',
            kind: 'class',
            isDefault: true,
            isTypeOnly: false,
          },

          // {
          //   exportedName: 'User',
          //   symbolName: 'User',
          //   kind: 'interface',
          //   isDefault: false,
          //   isTypeOnly: true,
          // },

          // {
          //   exportedName: 'foo',
          //   symbolName: 'foo',
          //   kind: 'const',
          //   isDefault: false,
          //   isTypeOnly: false,
          // },

          // {
          //   exportedName: 'foo2',
          //   symbolName: 'foo2',
          //   kind: 'const',
          //   isDefault: false,
          //   isTypeOnly: false,
          // },

          // {
          //   exportedName: 'UserRole',
          //   symbolName: 'UserRole',
          //   kind: 'enum',
          //   isDefault: false,
          //   isTypeOnly: false,
          // },
        ])
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
        const { project, projectRoot, projectName } = importPatternsFixture

        const filePath = path.join(projectRoot, 'src/index.ts')
        const program = Effect.gen(function* () {
          const result = yield* analyzeFile(importPatternsFixture, filePath)

          expect(result.analysis.imports).toEqual([
            {
              moduleSpecifier: './default-value.js',

              defaultImport: 'DefaultValue',

              namedImports: [],
            },

            {
              moduleSpecifier: './types.js',

              namedImports: [
                {
                  importedName: 'VERSION',

                  localName: 'VERSION',

                  isTypeOnly: false,
                },
                {
                  importedName: 'createUser',

                  localName: 'buildUser',

                  isTypeOnly: false,
                },
              ],
            },

            {
              moduleSpecifier: './types.js',

              namespaceImport: 'Types',

              namedImports: [],
            },
            {
              moduleSpecifier: './types.js',

              namedImports: [
                {
                  importedName: 'User',

                  localName: 'User',

                  isTypeOnly: true,
                },
                {
                  importedName: 'UserId',

                  localName: 'UserId',

                  isTypeOnly: true,
                },
              ],
            },
          ])
        })
        Effect.runSync(program)
      },
      timeout,
    )
  })
  describe('analyzeFile jsdoc analysis', () => {
    const firstJsDoc = (result: FileAnalysisResult) => {
      const jsDoc = result.metadata.parsedJsDocs.values().next().value

      expect(jsDoc).toBeDefined()

      return jsDoc!
    }
    const firstJsDocAnalysis = (result: FileAnalysisResult) => {
      const analysis = result.analysis.exports[0]?.symbol.jsDoc

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

          console.dir(result, { depth: null })

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
