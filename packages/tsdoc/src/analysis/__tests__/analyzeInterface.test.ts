import path from 'node:path'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type {
  DocumentableMethodMemberAnalysis,
  DocumentablePropertyMemberAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/typescript'

const timeout = 20000

const interfaceFixture = createFixtureProject(path.join('analysis', 'interface'))

const interfaceAnalysisProgram = (sourceFile: string): SymbolAnalysis => {
  const { projectRoot } = interfaceFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(interfaceFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(Effect.map((result) => result.analysis.symbols[0]))
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}
const interfaceSymbolsDependencyProgram = (sourceFile: string, folder?: string) => {
  const { project, projectRoot, projectName } = interfaceFixture

  const sourcePath = folder ? path.join('src', folder, sourceFile) : path.join('src', sourceFile)
  const filePath = path.join(projectRoot, sourcePath)
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(interfaceFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(
        Effect.map((result) => {
          fs.writeFileSync('./log/fileAnalysis.txt', JSON.stringify(result.analysis, null, 2))
          const exports = result.analysis.symbols.map((s) => {
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
            target: { scope: 'import', localName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$generics', 'U'] },
            target: { scope: 'local-file', symbolName: 'LocalClass' },
          },
          {
            source: { memberPath: ['$extend', 0] },
            target: { scope: 'import', localName: 'ImportedBase' },
          },
          {
            source: { memberPath: ['$extend', 1] },
            target: { scope: 'local-file', symbolName: 'LocalBase' },
          },
          {
            source: { memberPath: ['$member', 'localProperty'] },
            target: { scope: 'local-file', symbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'importedProperty'] },
            target: { scope: 'import', localName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'localMethod', '$parameters', 'value'] },
            target: { scope: 'local-file', symbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'localMethod', '$return'] },
            target: { scope: 'import', localName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'importedMethod', '$parameters', 'value'] },
            target: { scope: 'import', localName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'importedMethod', '$return'] },
            target: { scope: 'local-file', symbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$generics', 'A'] },
            target: { scope: 'import', localName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$generics', 'B'] },
            target: { scope: 'local-file', symbolName: 'LocalClass' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$parameters', 'local'] },
            target: { scope: 'local-file', symbolName: 'LocalType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$parameters', 'imported'] },
            target: { scope: 'import', localName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'callback', '$return'] },
            target: { scope: 'import', localName: 'ImportedClass' },
          },
          {
            source: { memberPath: ['$member', 'nested', 0, '$generics', 0] },
            target: { scope: 'import', localName: 'ImportedType' },
          },
          {
            source: { memberPath: ['$member', 'nested', 1, '$generics', 1, '$generics', 0] },
            target: { scope: 'local-file', symbolName: 'LocalType' },
          },
        ]),
      )
    },
    timeout,
  )
})
