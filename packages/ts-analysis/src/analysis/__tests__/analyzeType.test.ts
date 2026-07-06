import path from 'node:path'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'

import type {
  DocumentableMethodMemberAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/schemas/typescript'

const timeout = 20000

const typeFixture = createFixtureProject(path.join('analysis', 'type'))

const typeAnalysisProgram = (sourceFile: string): SymbolAnalysis => {
  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(typeFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(Effect.map((result2) => result2.analysis.symbols[0]))
    }),
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
      return yield* analyzeFile(typeFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(
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
    '02-type-literal-property-types.ts',
    async () => {
      const result = await typeAnalysisProgram('02-type-literal-property-types.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '03-type-literal-nested-object.ts',
    async () => {
      const result = await typeAnalysisProgram('03-type-literal-nested-object.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '04-type-literal-function-types.ts',
    async () => {
      const result = await typeAnalysisProgram('04-type-literal-function-types.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '05-type-literal-overloads.ts',
    async () => {
      const result = await typeAnalysisProgram('05-type-literal-overloads.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '06-type-literal-effect.ts',
    async () => {
      const result = await typeAnalysisProgram('06-type-literal-effect.ts')

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
      console.dir(result, { depth: null })
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
            source: { memberPath: ['$type'] },
            target: { scope: 'import', localSymbolName: 'ImportedCallback' },
          },
          {
            source: { memberPath: ['$type', '$generics', 0] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
        ]),
      )
      expect(LocalClassAlias).toBeDefined()
      expect(LocalClassAlias?.dependencies).toEqual(
        expect.arrayContaining([
          {
            source: { memberPath: ['$type'] },
            target: { scope: 'local-file', localSymbolName: 'LocalClass' },
          },
        ]),
      )
      expect(IntersectionAlias).toBeDefined()
      expect(IntersectionAlias?.dependencies).toEqual(
        expect.arrayContaining([
          {
            source: { memberPath: ['$type', 0] },
            target: { scope: 'import', localSymbolName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$type', 1] },
            target: { scope: 'local-file', localSymbolName: 'LocalType' },
          },
        ]),
      )
    },
    timeout,
  )
})
