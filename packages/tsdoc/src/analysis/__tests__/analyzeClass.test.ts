import path from 'node:path'
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

const classFixture = createFixtureProject(path.join('analysis', 'class'))

const classAnalysisProgram = (sourceFile: string): SymbolAnalysis => {
  const { project, projectRoot, projectName } = classFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(classFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(Effect.map((result) => result.analysis.symbols[0]))
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
