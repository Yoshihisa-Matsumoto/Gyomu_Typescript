import path from 'node:path'
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type {
  DependencyCandidate,
  DocumentableMethodMemberAnalysis,
  DocumentablePropertyMemberAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/typescript'

const timeout = 20000

const classFixture = createFixtureProject(path.join('analysis', 'class'))

const classAnalysisProgram = (sourceFile: string, folder?: string): SymbolAnalysis => {
  const { project, projectRoot, projectName } = classFixture

  const sourcePath = folder ? path.join('src', folder, sourceFile) : path.join('src', sourceFile)
  const filePath = path.join(projectRoot, sourcePath)
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(classFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(
        Effect.map((result) => result.analysis.symbols.find((s) => s.signature.id == 'class')),
      )
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

const classSymbolsDependencyProgram = (sourceFile: string, folder?: string) => {
  const { project, projectRoot, projectName } = classFixture

  const sourcePath = folder ? path.join('src', folder, sourceFile) : path.join('src', sourceFile)
  const filePath = path.join(projectRoot, sourcePath)
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(classFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(
        Effect.map((result) => {
          if (!fs.existsSync('./log')) fs.mkdirSync('./log')
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

describe('analyze Class pattern', () => {
  it(
    '01-class-members-basic.ts',
    async () => {
      const result = await classAnalysisProgram('01-class-members-basic.ts')

      console.dir(result, { depth: null })
      expect(
        result.members.map((m) => {
          return {
            kind: m.kind,
            name: m.name,
          }
        }),
      ).toMatchObject([
        { kind: 'property', name: 'name' },
        { kind: 'method', name: 'getName' },
      ])
    },
    timeout,
  )
  it(
    '02-class-members-readonly.ts',
    async () => {
      const result = await classAnalysisProgram('02-class-members-readonly.ts')

      console.dir(result, { depth: null })
      expect(result.members.find((m) => m.kind == 'property')?.readonly).toBeTruthy()
    },
    timeout,
  )
  it(
    '03-class-members-optional.ts',
    async () => {
      const result = await classAnalysisProgram('03-class-members-optional.ts')

      console.dir(result, { depth: null })
      expect(result.members.find((m) => m.kind == 'property')?.optional).toBeTruthy()
      expect(
        (
          result.members.find((m) => m.kind == 'method')
            ?.parameters[0] as DocumentablePropertyMemberAnalysis
        ).optional,
      ).toBeTruthy()
    },
    timeout,
  )
  it(
    '04-class-members-parameters.ts',
    async () => {
      const result = await classAnalysisProgram('04-class-members-parameters.ts')

      console.dir(result, { depth: null })
      const method = result.members.find((m) => m.kind == 'method')!
      const parameters = method.parameters
      expect(parameters.length).toBe(3)
      expect((parameters[0] as DocumentablePropertyMemberAnalysis).optional).toBeFalsy()
    },
    timeout,
  )
  it(
    '05-class-members-complex-types.ts',
    async () => {
      const result = await classAnalysisProgram('05-class-members-complex-types.ts')

      console.dir(result, { depth: null })
      expect(result.members.length).toBe(2)
      const property = result.members.find((m) => m.kind == 'property')
      expect(property?.type?.text).toBe('User | undefined')
      const method = result.members.find((m) => m.kind == 'method')
      expect(method?.returnType?.text).toBe('Promise<Array<User>>')
      // TODO : more precise analysis of type
    },
    timeout,
  )
  it(
    '06-class-members-accessors.ts',
    async () => {
      const result = await classAnalysisProgram('06-class-members-accessors.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '07-class-members-static.ts',
    async () => {
      const result = await classAnalysisProgram('07-class-members-static.ts')

      console.dir(result, { depth: null })
      expect(result.members.length).toBe(2)
      expect(result.members.filter((v) => v.static).length).toBe(2)
    },
    timeout,
  )
  it(
    '08-class-members-constructor.ts',
    async () => {
      const result = await classAnalysisProgram('08-class-members-constructor.ts')

      console.dir(result, { depth: null })
      expect(result.members.length).toBe(3)
      expect(result.members.filter((v) => v.kind == 'method').length).toBe(2)
      const constructor: DocumentableMethodMemberAnalysis = result.members.find(
        (m) => m.name == '$constructor' && m.kind == 'method',
      )! as DocumentableMethodMemberAnalysis
      expect(constructor).toBeDefined()
      expect(constructor.parameters.length).toBe(1)
      expect(constructor.parameters[0]?.name).toBe('id')
    },
    timeout,
  )
  it(
    '09-class-members-generics.ts',
    async () => {
      const result = await classAnalysisProgram('09-class-members-generics.ts')

      console.dir(result, { depth: null })
      expect(result.members.length).toBe(1)
      // TODO Generics
    },
    timeout,
  )
  it(
    '10-class-members-effect.ts',
    async () => {
      const result = await classAnalysisProgram('10-class-members-effect.ts')

      const member: DocumentableMethodMemberAnalysis = result
        .members[0] as DocumentableMethodMemberAnalysis

      expect(member.returnType?.effect).toMatchObject({
        returnsEffect: true,

        success: {
          text: 'User',
        },

        error: {
          text: 'Error',
        },

        requirements: {
          text: 'Repository',
        },

        hasErrorType: true,

        hasRequirementsType: true,

        effectDepth: 1,
      })
    },
    timeout,
  )
  it(
    '11-class-members-everything.ts',
    async () => {
      const result = await classAnalysisProgram('11-class-members-everything.ts')

      console.dir(result, { depth: null })
      expect(result.members.length).toBe(7)
    },
    timeout,
  )
})

describe('analyze Class dependency pattern', () => {
  it(
    '01-heritage.ts',
    async () => {
      const result = await classSymbolsDependencyProgram('01-heritage.ts', 'dependency')

      console.dir(result, { depth: null })
      expect(result).toEqual(
        expect.arrayContaining([
          {
            name: 'HeritageClass',
            dependencies: [
              {
                source: { memberPath: ['$extend', 0] },
                target: { scope: 'import', localName: 'ImportedBaseClass' },
              },
              {
                source: { memberPath: ['$implement', 1] },
                target: { scope: 'import', localName: 'ImportedInterface' },
              },
              {
                source: { memberPath: ['$implement', 2] },
                target: { scope: 'local-file', symbolName: 'LocalInterface' },
              },
            ],
          },
          {
            name: 'LocalHeritageClass',
            dependencies: [
              {
                source: { memberPath: ['$extend', 0] },
                target: { scope: 'local-file', symbolName: 'LocalBaseClass' },
              },
              {
                source: { memberPath: ['$implement', 1] },
                target: { scope: 'local-file', symbolName: 'LocalInterface' },
              },
            ],
          },
        ]),
      )
    },
    timeout,
  )
  it(
    '02-members.ts',
    async () => {
      const result = await classSymbolsDependencyProgram('02-members.ts', 'dependency')

      console.dir(result, { depth: null })
      const member = result.find((r) => r.name == 'MemberDependencyClass')
      const dependencies = member?.dependencies
      expect(dependencies).toBeDefined()

      if (dependencies) {
        expect(dependencies).toEqual(
          expect.arrayContaining([
            {
              source: { memberPath: ['$member', 'localProperty'] },
              target: {
                scope: 'local-file',
                symbolName: 'LocalType',
              },
            },
            {
              source: { memberPath: ['$member', 'importedProperty'] },
              target: {
                scope: 'import',
                localName: 'ImportedType',
              },
            },
            {
              source: { memberPath: ['$member', 'localInitialized'] },
              target: {
                scope: 'local-file',
                symbolName: 'localFactory',
              },
            },
            {
              source: { memberPath: ['$constructor', '$parameters', 'local'] },
              target: {
                scope: 'local-file',
                symbolName: 'LocalType',
              },
            },
            {
              source: { memberPath: ['$constructor', '$parameters', 'imported'] },
              target: {
                scope: 'import',
                localName: 'ImportedType',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'localFunction',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'import',
                localName: 'importedFunction',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'LocalClass',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'import',
                localName: 'ImportedClass',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'localProperty',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'local',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'importedProperty',
              },
            },
            {
              source: { memberPath: ['$constructor', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'imported',
              },
            },
            {
              source: { memberPath: ['method', '$parameters', 'local'] },
              target: {
                scope: 'local-file',
                symbolName: 'LocalType',
              },
            },
            {
              source: { memberPath: ['method', '$parameters', 'imported'] },
              target: {
                scope: 'import',
                localName: 'ImportedType',
              },
            },
            {
              source: { memberPath: ['method', '$return'] },
              target: {
                scope: 'import',
                localName: 'ImportedType',
              },
            },
            {
              source: { memberPath: ['method', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'localFunction',
              },
            },
            {
              source: { memberPath: ['method', '$body'] },
              target: {
                scope: 'import',
                localName: 'importedFunction',
              },
            },
            {
              source: { memberPath: ['method', '$body'] },
              target: {
                scope: 'local-file',
                symbolName: 'LocalClass',
              },
            },
            {
              source: { memberPath: ['method', '$body'] },
              target: {
                scope: 'import',
                localName: 'ImportedClass',
              },
            },
          ] satisfies Array<DependencyCandidate>),
        )
      }
    },
    timeout,
  )
  it(
    '03-nested-types.ts',
    async () => {
      const result = await classSymbolsDependencyProgram('03-nested-types.ts', 'dependency')

      console.dir(result, { depth: null })
      const member = result.find((r) => r.name == 'NestedTypes')
      const dependencies = member?.dependencies
      expect(dependencies).toBeDefined()

      if (dependencies) {
        expect(dependencies).toEqual(
          expect.arrayContaining([
            {
              source: { memberPath: ['$member', 'a', '$generics', 0] },
              target: { scope: 'import', localName: 'ImportedType' },
            },
            {
              source: { memberPath: ['$member', 'b', '$generics', 1, '$generics', 0] },
              target: { scope: 'import', localName: 'ImportedType' },
            },
            {
              source: { memberPath: ['$member', 'c', '$generics', 0] },
              target: { scope: 'local-file', symbolName: 'LocalType' },
            },
            {
              source: { memberPath: ['$member', 'd', '$generics', 0, '$generics', 1] },
              target: { scope: 'local-file', symbolName: 'LocalType' },
            },
            {
              source: { memberPath: ['$member', 'e', 0] },
              target: { scope: 'import', localName: 'ImportedType' },
            },
            {
              source: { memberPath: ['$member', 'e', 1] },
              target: { scope: 'local-file', symbolName: 'LocalType' },
            },
            {
              source: { memberPath: ['$member', 'f'] },
              target: { scope: 'import', localName: 'ImportedResult' },
            },
            {
              source: { memberPath: ['$member', 'f', '$generics', 0] },
              target: { scope: 'local-file', symbolName: 'LocalType' },
            },
            {
              source: { memberPath: ['$member', 'g', '$generics', 1] },
              target: { scope: 'import', localName: 'ImportedType' },
            },
            {
              source: { memberPath: ['$member', 'h', 0] },
              target: { scope: 'local-file', symbolName: 'LocalClass' },
            },
            {
              source: { memberPath: ['$member', 'h', 1] },
              target: { scope: 'import', localName: 'ImportedType' },
            },
          ] satisfies Array<DependencyCandidate>),
        )
      }
    },
    timeout,
  )
  it(
    '04-generics.ts',
    async () => {
      const result = await classSymbolsDependencyProgram('04-generics.ts', 'dependency')

      console.dir(result, { depth: null })
      const member = result.find((r) => r.name == 'GenericClass')
      const dependencies = member?.dependencies
      expect(dependencies).toBeDefined()

      if (dependencies) {
        expect(dependencies).toEqual(
          expect.arrayContaining([
            {
              source: { memberPath: ['method', '$generics', 'A'] },
              target: { scope: 'import', localName: 'ImportedType' },
            },
            {
              source: { memberPath: ['method', '$generics', 'B'] },
              target: { scope: 'local-file', symbolName: 'LocalClass' },
            },
            {
              source: { memberPath: ['$generics', 'T'] },
              target: { scope: 'import', localName: 'ImportedType' },
            },
            {
              source: { memberPath: ['$generics', 'U'] },
              target: { scope: 'local-file', symbolName: 'LocalClass' },
            },
          ] satisfies Array<DependencyCandidate>),
        )
      }
    },
    timeout,
  )
})
