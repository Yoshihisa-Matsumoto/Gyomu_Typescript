import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { createFixtureProject } from '../../analysis/__tests__/createFixtureProject.js'
import { analyzeFile } from '../../analysis/analyzeFile.js'
import { buildJsDocUpdateContext } from '../internal/buildJsDocUpdateContext.js'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'

const timeout = 20000

const updateFixture = createFixtureProject(path.join('update'))

const buildJsDocUpdateContextProgram = (sourceFile: string) => {
  const { project, projectRoot } = updateFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  return Effect.runSync(
    Effect.gen(function* () {
      const result = yield* analyzeFile({ project, projectRoot }, filePath, {
        includeDebugInfo: true,
      })
      return buildJsDocUpdateContext('test-project', result)
    }),
  )
}

describe('buildJsDocUpdateContext integration', () => {
  const firstJsDoc = (result: FileAnalysisResult) => {
    const jsDoc = result.metadata.parsedJsDocs.values().next().value

    expect(jsDoc).toBeDefined()

    return jsDoc!
  }
  const firstJsDocAnalysis = (result: FileAnalysisResult) => {
    const analysis = result.analysis.exports[0]?.symbol.jsDoc

    expect(analysis).toBeDefined()

    return analysis!
  }

  it(
    'generate-simple.ts',
    async () => {
      const context = await buildJsDocUpdateContextProgram('generated-simple.ts')

      console.dir(context, { depth: null })
      expect(context).toHaveLength(1)
      expect(context[0]!.mode).toBe('light')
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
      expect(context[0]!.existingJsDoc!.summary).toBe('Add numbers')
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
      const ids = contexts.map((x) => x.symbol.signature)

      expect(new Set(ids).size).toBe(2)
    },
    timeout,
  )
})
