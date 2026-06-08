import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type {
  DocumentableMethodMemberAnalysis,
  DocumentablePropertyMemberAnalysis,
} from '../symbol/MemberAnalysis.js'
import type { SymbolAnalysis } from '../symbol/SymbolAnalysis.js'

const timeout = 20000

const interfaceFixture = createFixtureProject(path.join('analysis', 'interface'))

const interfaceAnalysisProgram = (sourceFile: string): SymbolAnalysis => {
  const { projectRoot } = interfaceFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(interfaceFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(Effect.map((result) => result.analysis.exports[0]?.symbol))
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
