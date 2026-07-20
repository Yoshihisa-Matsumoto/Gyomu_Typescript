import path from 'node:path'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { PlatformLayer } from '@gyomu/infra'
import { flattenIssues } from '@gyomu/schema/entity'
import { analyzeFile } from '../analyzeFile.js'
import { saveFileAnalysis } from '../saveFileAnalysis.js'
import { loadFileAnalysis } from '../loadFileAnalysis.js'
import { createFixtureProject } from './createFixtureProject.js'

import type {
  OptionalStructureAnalysis,
  SymbolAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const typeFixture = createFixtureProject(path.join('analysis', 'type'))

const typeAnalysisProgram = async (
  sourceFile: string,
  index: number = 0,
): Promise<SymbolAnalysis> => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(typeFixture, filePath, {
        // includeDebugInfo: true,
        debugInfo: { verifyIndex: true },
      })
      yield* saveFileAnalysis(typeFixture, fileResult.analysis).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/schema/SchemaErrorContext') {
            if (e.issues) {
              const issue = flattenIssues(e.issues)
              // fs.writeFileSync(path.join('log', 'SaveError.txt'), JSON.stringify(issue, null, 2))
              console.log('Save')
              console.dir(issue, { depth: null })
            }
          }

          return Effect.fail(e)
        }),
      )

      const loaded = yield* loadFileAnalysis(typeFixture, fileResult.analysis.path).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/agent/tsdoc/AnalysisError') {
            const error = e.cause as object
            if ('issues' in error) {
              if (error.issues) {
                const issue = flattenIssues(error.issues as any)
                console.dir(issue, { depth: null })
              }
            }
          }

          return Effect.fail(e)
        }),
      )

      expect(loaded).toEqual(fileResult.analysis)
      return fileResult
    })
      .pipe(Effect.provide(PlatformLayer))
      .pipe(Effect.map((result2) => result2.analysis.symbols[index])),
  )

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}
const typeAnalysisSymbolsProgram = async (
  sourceFile: string,
  keyword: string = '',
): Promise<ReadonlyArray<SymbolAnalysis>> => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(typeFixture, filePath, {
        debugInfo: { verifyIndex: true, keyword },
      })

      yield* saveFileAnalysis(typeFixture, fileResult.analysis).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/schema/SchemaErrorContext') {
            if (e.issues) {
              const issue = flattenIssues(e.issues)
              // fs.writeFileSync(path.join('log', 'SaveError.txt'), JSON.stringify(issue, null, 2))
              console.log('Save')
              console.dir(issue, { depth: null })
            }
          }

          return Effect.fail(e)
        }),
      )

      const loaded = yield* loadFileAnalysis(typeFixture, fileResult.analysis.path).pipe(
        Effect.catch((e) => {
          if (e._tag == '@gyomu/agent/tsdoc/AnalysisError') {
            const error = e.cause as object
            if ('issues' in error) {
              if (error.issues) {
                const issue = flattenIssues(error.issues as any)
                console.dir(issue, { depth: null })
              }
            }
          }

          return Effect.fail(e)
        }),
      )

      expect(loaded).toEqual(fileResult.analysis)
      return fileResult
    })
      .pipe(Effect.provide(PlatformLayer))
      .pipe(Effect.map((result2) => result2.analysis.symbols)),
  )

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}
const typeStructureProgram = async (
  sourceFile: string,
): Promise<ReadonlyArray<TypeStructureAnalysis>> => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(typeFixture, filePath, {
        debugInfo: { verifyIndex: true },
      })
      yield* saveFileAnalysis(typeFixture, fileResult.analysis)

      const loaded = yield* loadFileAnalysis(typeFixture, fileResult.analysis.path)

      expect(loaded).toEqual(fileResult.analysis)
      return fileResult
    })
      .pipe(Effect.provide(PlatformLayer))
      .pipe(
        Effect.map((result2) =>
          result2.analysis.symbols.map((symbol) => symbol.type?.structure).filter((s) => !!s),
        ),
      ),
  )

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}
const typeSymbolsDependencyProgram = (sourceFile: string, folder?: string) => {
  const sourcePath = folder ? path.join('src', folder, sourceFile) : path.join('src', sourceFile)
  const filePath = ProjectRelativePath(sourcePath)
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(typeFixture, filePath, { debugInfo: { verifyIndex: true } }).pipe(
        Effect.map((result2) => {
          if (!fs.existsSync('./log')) fs.mkdirSync('./log')
          fs.writeFileSync('./log/fileAnalysis.txt', JSON.stringify(result2.analysis, null, 2))
          const exports = result2.analysis.symbols.map((s) => {
            return {
              name: s.identity.symbolId,
              dependencies: s.dependencyCandidates,
            }
          })
          return exports
        }),
      )
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}
describe('analyze TypeLiteral pattern', () => {
  it(
    '01-type-literal-members-everythings.ts',
    async () => {
      const result = await typeAnalysisProgram('01-type-literal-members-everything.ts')

      // console.dir(result, { depth: null })
      expect(result.type?.structure).toBeDefined()
      if (result.type?.structure) {
        const structure = result.type.structure
        expect(structure.kind).toBe('object')
        if (structure.kind == 'object') {
          expect(structure.properties).toMatchObject([
            {
              name: 'serviceName',
              readonly: true,
              optional: false,
              type: {
                text: 'string',
              },
            },

            {
              name: 'cache',
              readonly: false,
              optional: true,
              type: {
                structure: {
                  kind: 'reference',
                },

                text: 'Map<string, string>',
              },
            },

            {
              name: 'getName',
              type: {
                structure: {
                  parameters: [],
                  kind: 'function',
                  returnType: {
                    text: 'string',
                  },
                },
              },
            },

            {
              name: 'find',
              type: {
                structure: {
                  kind: 'function',
                  parameters: [
                    {
                      name: 'id',
                      optional: false,
                      rest: false,
                      type: {
                        text: 'string',
                      },
                    },
                    {
                      name: 'options',
                      optional: false,
                      rest: true,
                      type: {
                        text: 'Array<string>',
                      },
                    },
                  ],
                  returnType: {
                    text: 'Promise<T>',
                  },
                },
              },
            },
          ])
        }
      }
    },
    timeout,
  )
  it(
    '02-type-literal-property-types.ts',
    async () => {
      const result = await typeAnalysisProgram('02-type-literal-property-types.ts')

      // console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '03-type-literal-nested-object.ts',
    async () => {
      const result = await typeAnalysisProgram('03-type-literal-nested-object.ts')

      // console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '04-type-literal-function-types.ts',
    async () => {
      const result = await typeAnalysisProgram('04-type-literal-function-types.ts')

      // console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '05-type-literal-overloads.ts',
    async () => {
      const result = await typeAnalysisProgram('05-type-literal-overloads.ts')

      // console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '06-type-literal-effect.ts',
    async () => {
      const result = await typeAnalysisProgram('06-type-literal-effect.ts')

      // console.dir(result, { depth: null })
      const structure = result.type?.structure
      expect(structure).toBeDefined()
      if (structure) {
        expect(structure.kind).toBe('object')
        if (structure.kind == 'object' && structure.properties?.[0]) {
          const member = structure.properties[0]
          expect(member.name).toBe('findUser')
          expect(member.type?.structure).toBeDefined()
          if (member.type?.structure) {
            const functionStructure = member.type.structure
            expect(functionStructure.kind).toBe('function')
            if (functionStructure.kind == 'function') {
              expect(functionStructure.returnType.effect).toMatchObject({
                returnsEffect: true,
                success: { text: 'User' },
                error: { text: 'Error' },
                requirements: { text: 'Repository' },
                hasErrorType: true,
                hasRequirementsType: true,
                effectDepth: 1,
              })
            }
          }
        }
      }
    },
    timeout,
  )
  it(
    '07-type-structure.ts',
    async () => {
      const result = await typeAnalysisProgram('07-type-structure.ts')

      // console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '08-type-import.ts',
    async () => {
      const result = await typeStructureProgram('08-type-import.ts')

      // console.dir(result, { depth: null })
      expect(result).toEqual(
        expect.arrayContaining([
          {
            kind: 'import',
            moduleSpecifier: 'src/types.ts',
            qualifier: 'User',
            typeArguments: [],
          },
          {
            kind: 'import',
            moduleSpecifier: 'src/types.ts',
            qualifier: 'Box',
            typeArguments: [{ text: 'string', source: 'typescript' }],
          },
          {
            kind: 'import',
            moduleSpecifier: 'src/types.ts',
            qualifier: 'Namespace.Member',
            typeArguments: [],
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '09-type-rest.ts',
    async () => {
      const a = await typeAnalysisProgram('09-type-rest.ts', 1)
      // console.dir(a, { depth: null })
      const result = await typeStructureProgram('09-type-rest.ts')

      const rests = result
        .filter((s) => s.kind == 'tuple')
        .map((t) => t.elements.find((e) => e.type?.structure?.kind == 'rest')?.type?.structure)
        .filter((s) => !!s)
      expect(rests.filter((r) => r.kind == 'rest').map((r) => r.type.structure)).toEqual(
        expect.arrayContaining([
          { kind: 'array', elementType: { text: 'number', source: 'typescript' } },
          { kind: 'reference', targetId: 'T', typeParameters: [] },
          { kind: 'reference', targetId: 'T', typeParameters: [] },
        ]),
      )
    },
    timeout,
  )
  it(
    '10-type-optional.ts',
    async () => {
      const result = await typeStructureProgram('10-type-optional.ts')

      // console.dir(result, { depth: null })
      const options: ReadonlyArray<OptionalStructureAnalysis> = result
        .filter((s) => s.kind == 'tuple')
        .map((s) => s.elements)
        .flat()
        .filter((s) => s.type?.structure?.kind == 'optional')
        .map((s) => s.type?.structure as OptionalStructureAnalysis)
      // console.dir(options, { depth: null })
      expect(options.map((o) => o.type.text)).toEqual(
        expect.arrayContaining(['string', 'string', 'boolean']),
      )
    },
    timeout,
  )
  it(
    '11-type-literal-node.ts',
    async () => {
      const result = await typeAnalysisSymbolsProgram('11-type-literal-node.ts', 'MethodSignature')
      // console.dir(result, { depth: null })
      expect(result.length).toBe(7)
      const converted = result.map((s) => ({
        name: s.identity.symbolId,
        members: s.members,
        type: s.type,
      }))

      // console.dir(converted, { depth: null })
    },
    timeout,
  )
  it(
    '12-diff-entities.ts',
    async () => {
      const result = await typeAnalysisSymbolsProgram('12-diff-entities.ts', 'diffEntities')
      // console.dir(result, { depth: null })
      expect(result.length).toBe(1)
      const converted = result.map((s) => ({
        name: s.identity.symbolId,
        members: s.members,
        type: s.type,
      }))

      // console.dir(converted, { depth: null })
    },
    timeout,
  )
})
describe('analyze Type dependency pattern', () => {
  it(
    '01-type-dependency.ts',
    async () => {
      const result = await typeSymbolsDependencyProgram('01-type-dependency.ts', 'dependency')
      const DependencyType = result.find((s) => s.name === 'DependencyType')
      const ImportedCallbackAlias = result.find((s) => s.name === 'ImportedCallbackAlias')
      const LocalClassAlias = result.find((s) => s.name === 'LocalClassAlias')
      const IntersectionAlias = result.find((s) => s.name === 'IntersectionAlias')
      // console.dir(result, { depth: null })
      expect(DependencyType).toBeDefined()
      expect(DependencyType?.dependencies).toEqual(
        expect.arrayContaining([
          {
            source: { memberPath: ['$generics', 'T'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$generics', 'U'] },
            target: { scope: 'local-file', localSymbolName: 'LocalClass' },
          },
          {
            source: { memberPath: ['$member', 'local'] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'imported'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$generics', 'A'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$generics', 'B'] },
            target: { scope: 'local-file', localSymbolName: 'LocalClass' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$parameters', 'local'] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$parameters', 'imported'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$return'] },
            target: { scope: 'import', localSymbolName: 'ImportedResult' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$return', '$generics', 0] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'nested', 0, '$generics', 0] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'nested', 1, '$generics', 1, '$generics', 0] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
        ]),
      )
      expect(ImportedCallbackAlias).toBeDefined()
      expect(ImportedCallbackAlias?.dependencies).toEqual(
        expect.arrayContaining([
          {
            source: { memberPath: [] },
            target: { scope: 'import', localSymbolName: 'ImportedCallback' },
          },
          {
            source: { memberPath: ['$generics', 0] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
        ]),
      )
      expect(LocalClassAlias).toBeDefined()
      expect(LocalClassAlias?.dependencies).toEqual(
        expect.arrayContaining([
          {
            source: { memberPath: [] },
            target: { scope: 'local-file', localSymbolName: 'LocalClass' },
          },
        ]),
      )
      expect(IntersectionAlias).toBeDefined()
      expect(IntersectionAlias?.dependencies).toEqual(
        expect.arrayContaining([
          {
            source: { memberPath: [0] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: [1] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
        ]),
      )
    },
    timeout,
  )
})
