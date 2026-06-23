import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { createFixtureProject } from '../../../analysis/__tests__/createFixtureProject.js'
import { analyzeFile } from '../../../analysis/analyzeFile.js'
import { buildJsDocUpdateContext } from '../buildJsDocUpdateContext.js'
import { calculateComplexityMetrics } from '../../../evaluation/complexity/calculateComplexityMetrics.js'
// import type { FileAnalysisResult } from '../../../analysis/file/FileAnalysisResult.js'

const timeout = 20000

const updateFixture = createFixtureProject(path.join('update'))

const buildJsDocUpdateContextProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = updateFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  return Effect.runSync(
    Effect.gen(function* () {
      const result = yield* analyzeFile(updateFixture, filePath, {
        includeDebugInfo: true,
      })
      const mapComplexity = calculateComplexityMetrics(result)
      return buildJsDocUpdateContext('test-project', result, mapComplexity)
    }),
  )
}

describe('buildJsDocUpdateContext integration', () => {
  it(
    'generate-simple.ts',
    async () => {
      const context = await buildJsDocUpdateContextProgram('generated-simple.ts')

      console.dir(context, { depth: null })
      expect(context.symbols).toHaveLength(1)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(context.symbols[0]!.existingJsDoc).toBeUndefined()
    },
    timeout,
  )

  it(
    'existing-jsdoc.ts',
    async () => {
      const context = await buildJsDocUpdateContextProgram('existing-jsdoc.ts')

      console.dir(context, { depth: null })
      expect(context.symbols).toHaveLength(1)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(context.symbols[0]!.existingJsDoc!.summary).toBe('Add numbers')
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(context.symbols[0]!.existingJsDoc!.params).toHaveLength(2)
    },
    timeout,
  )

  it(
    'overload-function.ts',
    async () => {
      const contexts = await buildJsDocUpdateContextProgram('overload-function.ts')

      console.dir(contexts, { depth: null })
      expect(contexts.symbols.length).toBe(2)
      const ids = contexts.symbols.map((x) => x.target.signatureId)

      expect(new Set(ids).size).toBe(2)
    },
    timeout,
  )
  it(
    'mixed-exports.ts',
    async () => {
      const contexts = await buildJsDocUpdateContextProgram('mixed-exports.ts')

      console.dir(contexts, { depth: null })
      expect(contexts.symbols.length).toBe(3)
      const userInterface = contexts.symbols.find(
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
