import path from 'node:path'
import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { createVercelAiLayer } from '@gyomu/ai/provider/vercel'
import { makeRunner } from '@gyomu/schema/effect'

import 'dotenv/config'
import { describe, expect, it } from 'vitest'
import { analyzeFile } from '@gyomu/ts-analysis'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { AI_MODELS } from '@gyomu/ai'
import { TsDocRouteId } from '@gyomu/ai-compiler/jsdoc-update'
import { createFixtureProject } from '@gyomu/ts-analysis/testing'
import { buildMergePlan } from '../buildMergePlan.js'
import type { ParamActionValue } from '@gyomu/ai-compiler/jsdoc-update'
import type { MergeActionContext } from '../jsDoc/MergePlan.js'

const timeout = 20000

const updateFixture = createFixtureProject(path.join('update'))

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(
  createVercelAiLayer(new Map([[TsDocRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }]])),
)

const buildMergePlanProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = updateFixture

  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  const program = Effect.gen(function* () {
    const result = yield* analyzeFile(updateFixture, filePath, {
      // includeDebugInfo: true,
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
      expect(
        plan[0]?.params.every(
          (x: {
            name: string
            sortOrder: number
            action: MergeActionContext<ParamActionValue>
            conflict?: 'human-edited' | 'missing-in-new' | 'structural-mismatch'
          }) => x.action.type === 'preserve',
        ),
      ).toBe(true)
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
      expect(plan).toHaveLength(5)
      expect(plan.map((x) => x.target.symbolId)).toEqual(
        expect.arrayContaining([
          expect.stringContaining('User'),
          expect.stringContaining('createUser'),
          expect.stringContaining('VERSION'),
          expect.stringContaining('id'),
          expect.stringContaining('name'),
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
