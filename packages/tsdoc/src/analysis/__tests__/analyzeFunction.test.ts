import path from 'node:path'
import { describe, it } from 'vitest'
import { Effect } from 'effect'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { SymbolAnalysis } from '@gyomu/schema/typescript'

const timeout = 20000

const functionFixture = createFixtureProject(path.join('analysis', 'function'))

const functionAnalysisProgram = (sourceFile: string): SymbolAnalysis => {
  const { project, projectRoot, projectName } = functionFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  const result = Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(functionFixture, filePath, {
        includeDebugInfo: true,
      }).pipe(Effect.map((result) => result.analysis.exports[0]?.symbol))
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!result) throw new Error('Unexpected symbol should exist')
  return result
}

describe('analyze Function pattern', () => {
  it(
    '01-function-effect.ts',
    async () => {
      const result = await functionAnalysisProgram('01-function-effect.ts')

      console.dir(result, { depth: null })
    },
    timeout,
  )
})
