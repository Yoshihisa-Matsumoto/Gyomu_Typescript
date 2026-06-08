import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { createFixtureProject } from '../../../analysis/__tests__/createFixtureProject.js'
import { analyzeFile } from '../../../analysis/analyzeFile.js'
import { buildJsDocUpdateContext } from '../buildJsDocUpdateContext.js'
// import type { FileAnalysisResult } from '../../../analysis/file/FileAnalysisResult.js'

const timeout = 20000

const updateFixture = createFixtureProject(path.join('update'))

const buildJsDocUpdateContextProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = updateFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  return Effect.runSync(
    Effect.gen(function* () {
      const result = yield* analyzeFile({ project, projectRoot, projectName }, filePath, {
        includeDebugInfo: true,
      })
      return buildJsDocUpdateContext('test-project', result)
    }),
  )
}

describe('buildJsDocUpdateContext integration', () => {
  it(
    'generate-simple.ts',
    async () => {
      const context = await buildJsDocUpdateContextProgram('generated-simple.ts')

      console.dir(context, { depth: null })
      expect(context).toHaveLength(1)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(context[0]!.mode).toBe('light')
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(context[0]!.existingJsDoc).toBeUndefined()
    },
    timeout,
  )

  it(
    'existing-jsdoc.ts',
    async () => {
      const context = await buildJsDocUpdateContextProgram('existing-jsdoc.ts')

      console.dir(context, { depth: null })
      expect(context).toHaveLength(1)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(context[0]!.existingJsDoc!.summary).toBe('Add numbers')
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(context[0]!.existingJsDoc!.params).toHaveLength(2)
    },
    timeout,
  )

  it(
    'overload-function.ts',
    async () => {
      const contexts = await buildJsDocUpdateContextProgram('overload-function.ts')

      console.dir(contexts, { depth: null })
      expect(contexts.length).toBe(2)
      const ids = contexts.map((x) => x.target.signatureId)

      expect(new Set(ids).size).toBe(2)
    },
    timeout,
  )
  it(
    'mixed-exports.ts',
    async () => {
      const contexts = await buildJsDocUpdateContextProgram('mixed-exports.ts')

      console.dir(contexts, { depth: null })
      expect(contexts.length).toBe(3)
      const userInterface = contexts.find(
        (c) => c.symbol.name == 'User' && c.symbol.kind == 'interface',
      )
      expect(userInterface).toBeDefined()
      expect(userInterface?.children?.length).toBe(2)
      expect(userInterface?.children?.map((c) => c.name)).toEqual(
        expect.arrayContaining(['id', 'name']),
      )
    },
    timeout,
  )
})
