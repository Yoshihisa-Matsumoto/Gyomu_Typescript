import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { flattenIssues } from '@gyomu/schema/entity'
import { PlatformLayer } from '@gyomu/infra'
import { analyzeFile } from '../analyzeFile.js'
import { saveFileAnalysis } from '../saveFileAnalysis.js'
import { loadFileAnalysis } from '../loadFileAnalysis.js'
import { createFixtureProject } from './createFixtureProject.js'

import type {
  DocumentableMethodMemberAnalysis,
  DocumentablePropertyMemberAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const interfaceFixture = createFixtureProject(path.join('analysis', 'interface'))

const interfaceAnalysisProgram = async (sourceFile: string): Promise<SymbolAnalysis> => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(interfaceFixture, filePath, {
        debugInfo: { verifyIndex: true },
      })
      yield* saveFileAnalysis(interfaceFixture, fileResult.analysis).pipe(
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

      const loaded = yield* loadFileAnalysis(interfaceFixture, fileResult.analysis.path).pipe(
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
      return fileResult.analysis.symbols[0]
    }).pipe(Effect.provide(PlatformLayer)),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}
const interfaceSymbolsDependencyProgram = async (sourceFile: string, folder?: string) => {
  const sourcePath = folder ? path.join('src', folder, sourceFile) : path.join('src', sourceFile)
  const filePath = ProjectRelativePath(sourcePath)
  const result = await Effect.runPromise(
    Effect.gen(function* () {
      const fileResult = yield* analyzeFile(interfaceFixture, filePath, {
        debugInfo: { verifyIndex: true },
      })

      yield* saveFileAnalysis(interfaceFixture, fileResult.analysis).pipe(
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

      const loaded = yield* loadFileAnalysis(interfaceFixture, fileResult.analysis.path).pipe(
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

      return fileResult.analysis.symbols.map((s) => {
        return {
          name: s.identity.symbolId,
          dependencies: s.dependencyCandidates,
        }
      })
    }).pipe(Effect.provide(PlatformLayer)),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

describe('analyze Interface pattern', () => {
  it(
    '01-interface-members-everything.ts',
    async () => {
      const result = await interfaceAnalysisProgram('01-interface-members-everything.ts')

      console.dir(result, { depth: null })
      expect(result.members).toMatchObject([
        {
          kind: 'property',
          name: 'serviceName',
          readonly: true,
          optional: false,
          static: false,
          visibility: 'public',
          type: {
            text: 'string',
          },
        },

        {
          kind: 'property',
          name: 'cache',
          readonly: false,
          optional: true,
          static: false,
          visibility: 'public',
          type: {
            text: 'Map<string, string>',
          },
        },

        {
          kind: 'method',
          name: 'getName',
          parameters: [],
          static: false,
          visibility: 'public',
          returnType: {
            text: 'string',
          },
        },

        {
          kind: 'method',
          name: 'find',
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
          static: false,
          visibility: 'public',
          returnType: {
            text: 'Promise<T>',
          },
        },
      ])
    },
    timeout,
  )
  it(
    '02-interface-property-types.ts',
    async () => {
      const result = await interfaceAnalysisProgram('02-interface-property-types.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '03-interface-method-overloads.ts',
    async () => {
      const result = await interfaceAnalysisProgram('03-interface-method-overloads.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '04-nested-object-interface.ts',
    async () => {
      const result = await interfaceAnalysisProgram('04-nested-object-interface.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '05-interface-method-effect.ts',
    async () => {
      const result = await interfaceAnalysisProgram('05-interface-method-effect.ts')

      console.dir(result, { depth: null })
      expect(
        (result.members[0] as DocumentableMethodMemberAnalysis).returnType?.effect,
      ).toMatchObject({
        returnsEffect: true,
        success: { text: 'User' },
        error: { text: 'Error' },
        requirements: { text: 'Repository' },
        hasErrorType: true,
        hasRequirementsType: true,
        effectDepth: 1,
      })
      expect((result.members[1] as DocumentablePropertyMemberAnalysis).type?.effect).toMatchObject({
        returnsEffect: true,
        success: { text: 'User' },
        error: { text: 'Error' },
        requirements: { text: 'Repository' },
        hasErrorType: true,
        hasRequirementsType: true,
        effectDepth: 1,
      })
      expect(
        (result.members[2] as DocumentableMethodMemberAnalysis).returnType?.effect,
      ).toMatchObject({
        returnsEffect: true,
        success: { text: 'User' },
        error: { text: 'Error' },
        requirements: { text: 'Repository' },
        hasErrorType: true,
        hasRequirementsType: true,
        effectDepth: 1,
      })
    },
    timeout,
  )
})
describe('analyze Interface dependency pattern', () => {
  it(
    '01-interface-dependency.ts',
    async () => {
      const result = await interfaceSymbolsDependencyProgram(
        '01-interface-dependency.ts',
        'dependency',
      )
      const dependencies = result.find((s) => s.name === 'DependencyInterface')

      console.dir(result, { depth: null })
      expect(dependencies).toBeDefined()
      expect(dependencies?.dependencies).toEqual(
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
            source: { memberPath: ['$extend', 0] },
            target: { scope: 'import', localSymbolName: 'ImportedBase' },
          },
          {
            source: { memberPath: ['$extend', 1] },
            target: { scope: 'local-file', localSymbolName: 'LocalBase' },
          },
          {
            source: { memberPath: ['$member', 'localProperty'] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'importedProperty'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'localMethod', '$parameters', 'value'] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'localMethod', '$return'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'importedMethod', '$parameters', 'value'] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'importedMethod', '$return'] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
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
            target: { scope: 'import', localSymbolName: 'ImportedClass' },
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
    },
    timeout,
  )
})
