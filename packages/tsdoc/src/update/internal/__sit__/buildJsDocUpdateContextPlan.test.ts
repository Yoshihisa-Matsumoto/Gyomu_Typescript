import path from 'node:path'
import { describe, it } from 'vitest'
import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer, makeRunner } from '@gyomu/infra'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'

import 'dotenv/config'
import { createFixtureProject } from '../../../analysis/__tests__/createFixtureProject.js'
import { analyzeFile } from '../../../analysis/analyzeFile.js'
import { buildJsDocUpdateContext } from '../buildJsDocUpdateContext.js'
import { buildJsDocUpdatePlan } from '../buildJsDocUpdatePlan.js'
import type { JsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'

const timeout = 20000

const updateFixture = createFixtureProject(path.join('update'))

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)

const buildJsDocUpdateContextProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = updateFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  const program = Effect.gen(function* () {
    const result = yield* analyzeFile({ project, projectRoot, projectName }, filePath, {
      includeDebugInfo: true,
    })
    const contexts = buildJsDocUpdateContext('test-project', result)

    const results: Array<JsDocUpdatePlan> = []

    for (const context of contexts) {
      const plan = yield* buildJsDocUpdatePlan(context)
      results.push(plan)
    }
    return results
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
