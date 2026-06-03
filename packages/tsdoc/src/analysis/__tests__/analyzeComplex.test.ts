import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { FileAnalysisResult } from '../file/FileAnalysisResult.js'

const timeout = 20000

const jsDocFixture = createFixtureProject(path.join('analysis', 'jsdoc'))

const tempJsdocProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = jsDocFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  return Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile({ project, projectRoot, projectName }, filePath, {
        includeDebugInfo: true,
      })
    }),
  )
}

describe('analyzeFile-complex pattern', () => {
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
    'analyzes 01-class-members.ts',
    async () => {
      const result = await tempJsdocProgram('01-class-members.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(1)
    },
    timeout,
  )
  it(
    'analyzes 02-interface-members.ts',
    async () => {
      const result = await tempJsdocProgram('02-interface-members.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(1)
    },
    timeout,
  )
  it(
    'analyzes 03-type-literal.ts',
    async () => {
      const result = await tempJsdocProgram('03-type-literal.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(1)
    },
    timeout,
  )
  it(
    'analyzes 04-function-property.ts',
    async () => {
      const result = await tempJsdocProgram('04-function-property.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(0)
    },
    timeout,
  )
  it(
    'analyzes 05-nested-type.ts',
    async () => {
      const result = await tempJsdocProgram('05-nested-type.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(0)
    },
    timeout,
  )
  it(
    'analyzes 06-overload.ts',
    async () => {
      const result = await tempJsdocProgram('06-overload.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(0)
    },
    timeout,
  )
  it(
    'analyzes 07-mixed-member-docs.ts',
    async () => {
      const result = await tempJsdocProgram('07-mixed-member-docs.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(0)
    },
    timeout,
  )
})
