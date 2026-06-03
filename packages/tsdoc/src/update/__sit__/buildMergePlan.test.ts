import path from 'node:path'
import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer, makeRunner } from '@gyomu/infra'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'

import 'dotenv/config'
import { describe, expect, it } from 'vitest'
import { buildMergePlan } from '../buildMergePlan.js'
import { createFixtureProject } from '../../analysis/__tests__/createFixtureProject.js'
import { analyzeFile } from '../../analysis/analyzeFile.js'

const timeout = 20000

const updateFixture = createFixtureProject(path.join('update'))

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)

const buildMergePlanProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = updateFixture

  const filePath = path.join(projectRoot, path.join('src', sourceFile))
  const program = Effect.gen(function* () {
    const result = yield* analyzeFile({ project, projectRoot, projectName }, filePath, {
      includeDebugInfo: true,
    })
    // console.dir(result, { depth: null })
    const mergePlans = yield* buildMergePlan('test-project', result)
    return mergePlans
  })
  return runQAWithEnvOrThrow(program, layer)
}

describe('buildMergePlan integration', () => {
  it(
    'generate-simple.ts',
    async () => {
      const plan = await buildMergePlanProgram('generated-simple.ts')

      console.dir(plan, { depth: null })
      expect(plan).toHaveLength(1)
      expect(plan[0]?.target.symbolId).toContain('add')
      expect(plan[0]?.summary.type).toBe('replace')
    },
    timeout,
  )

  it(
    'existing-jsdoc.ts',
    async () => {
      const plan = await buildMergePlanProgram('existing-jsdoc.ts')

      console.dir(plan, { depth: null })
      expect(plan).toHaveLength(1)
      expect(plan[0]?.params.every((x) => x.action.type === 'preserve')).toBe(true)
    },
    timeout,
  )

  it(
    'overload-function.ts',
    async () => {
      const plan = await buildMergePlanProgram('overload-function.ts')

      console.dir(plan, { depth: null })
      expect(plan).toHaveLength(2)
      expect(plan.map((x) => x.target.signatureId)).toEqual([
        '(text:string):string',
        '(buffer:Buffer):Buffer',
      ])
    },
    timeout,
  )
  it(
    'mixed-exports.ts',
    async () => {
      const plan = await buildMergePlanProgram('mixed-exports.ts')

      console.dir(plan, { depth: null })
      expect(plan).toHaveLength(3)
      expect(plan.map((x) => x.target.symbolId)).toEqual(
        expect.arrayContaining([
          expect.stringContaining('User'),
          expect.stringContaining('createUser'),
          expect.stringContaining('VERSION'),
        ]),
      )
    },
    timeout,
  )
  it(
    'returns-needed.ts',
    async () => {
      const plan = await buildMergePlanProgram('returns-needed.ts')

      console.dir(plan, { depth: null })
      expect(plan).toHaveLength(1)
      expect(plan[0]?.returns.type).toBe('replace')
    },
    timeout,
  )
})
