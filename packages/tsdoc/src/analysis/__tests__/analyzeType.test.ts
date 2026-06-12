import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { DocumentableMethodMemberAnalysis } from '@gyomu/schema/typescript'
import type { SymbolAnalysis } from '../symbol/SymbolAnalysis.js'

const timeout = 20000

const interfaceFixture = createFixtureProject(path.join('analysis', 'type'))

const interfaceAnalysisProgram = (sourceFile: string): SymbolAnalysis => {
  const { project, projectRoot, projectName } = interfaceFixture

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

describe('analyze TypeLiteral pattern', () => {
  it(
    '01-type-literal-members-everythings.ts',
    async () => {
      const result = await interfaceAnalysisProgram('01-type-literal-members-everything.ts')

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
      const result = await interfaceAnalysisProgram('02-type-literal-property-types.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '03-type-literal-nested-object.ts',
    async () => {
      const result = await interfaceAnalysisProgram('03-type-literal-nested-object.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '04-type-literal-function-types.ts',
    async () => {
      const result = await interfaceAnalysisProgram('04-type-literal-function-types.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '05-type-literal-overloads.ts',
    async () => {
      const result = await interfaceAnalysisProgram('05-type-literal-overloads.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
  it(
    '06-type-literal-effect.ts',
    async () => {
      const result = await interfaceAnalysisProgram('06-type-literal-effect.ts')

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
