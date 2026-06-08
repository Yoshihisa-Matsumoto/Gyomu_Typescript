import { describe, expect, test } from 'vitest'
import { Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer, makeRunner } from '@gyomu/infra'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { executeJsDocUpdatePlan } from '../executor/executeJsDocUpdatePlan.js'
import 'dotenv/config'
import type { LightJsDocContext } from '../context/JsDocUpdateContext.js'

const describeIfApiKey = process.env.GEMINI_API_KEY ? describe : describe.skip

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)

describeIfApiKey('executeJsDocUpdatePlan integration', () => {
  test('generates plans for documentable child members', async () => {
    const context: LightJsDocContext = {
      project: { name: 'simple test' },
      source: { relativePath: 'test/user.ts' },

      mode: 'light',

      target: {
        symbolId: 'User',
        signatureId: 'interface',
      },

      symbol: {
        name: 'User',
        kind: 'interface',
      },

      code: {
        snippet: `
export interface User {
  id: string
}
`,
      },

      existingJsDoc: {
        summary: 'User information.',
        params: [],
        tags: [],
      },

      children: [
        {
          id: 'User.id',

          name: 'id',
          kind: 'property',

          existingJsDoc: {
            summary: 'User identifier.',
            params: [],
            tags: [],
          },
        },
      ],

      relatedSymbols: [],

      options: {
        preserveStyle: true,
      },
    }

    const plan = await runQAWithEnvOrThrow(executeJsDocUpdatePlan(context), layer)

    console.dir(plan, { depth: null })

    expect(plan.length).toBeGreaterThanOrEqual(2)

    expect(plan.some((p) => p.identity.symbolId === 'User')).toBe(true)

    expect(plan.some((p) => p.identity.symbolId === 'User.id')).toBe(true)
  }, 60_000)
})
