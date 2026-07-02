import { describe, expect, test } from 'vitest'
import { Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { VercelAiModelServiceLive } from '@gyomu/ai/provider/vercel'
import { makeRunner } from '@gyomu/schema/effect'
import { executeJsDocUpdatePlan } from '../executor/executeJsDocUpdatePlan.js'
import 'dotenv/config'
import type { TsDocFileContext } from '../context/TsDocFileContext.js'

const describeIfApiKey = process.env.GEMINI_API_KEY ? describe : describe.skip

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)

describeIfApiKey('executeJsDocUpdatePlan integration', () => {
  test('generates plans for documentable child members', async () => {
    const context: TsDocFileContext = {
      project: { name: 'simple test' },
      source: { relativePath: 'test/user.ts' },

      // mode: 'light',

      symbols: [
        {
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
          effectSignals: undefined,
          children: [
            {
              target: {
                symbolId: 'User.id',
                signatureId: 'property',
              },

              name: 'id',
              kind: 'property',

              existingJsDoc: {
                summary: 'User identifier.',
                params: [],
                tags: [],
              },
              effectSignals: undefined,
            },
          ],

          relatedSymbols: [],
          analysis: undefined,
          dependencies: undefined,
        },
      ],
    }

    const plan = await runQAWithEnvOrThrow(executeJsDocUpdatePlan(context), layer)

    console.dir(plan, { depth: null })

    expect(plan.length).toBeGreaterThanOrEqual(2)

    expect(plan.some((p) => p.identity.symbolId === 'User')).toBe(true)

    expect(plan.some((p) => p.identity.symbolId === 'User.id')).toBe(true)
  }, 60_000)
})
