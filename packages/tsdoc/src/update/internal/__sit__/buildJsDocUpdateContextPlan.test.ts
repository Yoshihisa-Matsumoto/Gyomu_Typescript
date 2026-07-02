import path from 'node:path'
import { describe, it } from 'vitest'
import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'

import { makeRunner } from '@gyomu/schema/effect'
import 'dotenv/config'
import { analyzeFile } from '@gyomu/ts-analysis'
import { buildJsDocUpdateContext } from '../buildJsDocUpdateContext.js'
import { buildJsDocUpdatePlanWithRetry } from '../buildJsDocUpdatePlanWithRetry.js'
import { calculateComplexityMetrics } from '../../../evaluation/complexity/calculateComplexityMetrics.js'
import { createFixtureProject } from '../../__tests__/createFixtureProject.js'

const timeout = 20000

const updateFixture = createFixtureProject(path.join('update'))

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)

const buildJsDocUpdateContextProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = updateFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  const program = Effect.gen(function* () {
    const result = yield* analyzeFile(updateFixture, filePath, {
      includeDebugInfo: true,
    })
    const mapComplexity = calculateComplexityMetrics(result)
    const contexts = buildJsDocUpdateContext('test-project', result, mapComplexity)

    const plan = yield* buildJsDocUpdatePlanWithRetry(contexts, result)

    return plan
  })
  return runQAWithEnvOrThrow(program, layer)
}

describe('buildJsDocUpdateContext integration', () => {
  it(
    'generate-simple.ts',
    async () => {
      const plan = await buildJsDocUpdateContextProgram('generated-simple.ts')

      console.dir(plan, { depth: null })
    },
    timeout,
  )

  it(
    'existing-jsdoc.ts',
    async () => {
      const plan = await buildJsDocUpdateContextProgram('existing-jsdoc.ts')

      console.dir(plan, { depth: null })
    },
    timeout,
  )

  it(
    'overload-function.ts',
    async () => {
      const plan = await buildJsDocUpdateContextProgram('overload-function.ts')

      console.dir(plan, { depth: null })
    },
    timeout,
  )
  it(
    'expect-jsdoc-summary.ts',
    async () => {
      const plan = await buildJsDocUpdateContextProgram('expect-jsdoc-summary.ts')

      console.dir(plan, { depth: null })
    },
    timeout,
  )
})
