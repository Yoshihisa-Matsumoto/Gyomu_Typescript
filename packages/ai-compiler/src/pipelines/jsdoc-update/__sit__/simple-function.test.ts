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
  test('generates update plan for simple function', async () => {
    const context: LightJsDocContext = {
      project: { name: 'simple test' },
      source: { relativePath: 'test/simple-func.ts' },
      mode: 'light',
      target: {
        signatureId: '(a: number, b: number) => number',
        symbolId: 'add',
      },
      symbol: {
        name: 'add',
        kind: 'function',
      },
      relatedSymbols: [],
      code: {
        //         declarationSnippet: `
        // export const add = (
        //   a: number,
        //   b: number,
        // ): number
        // `,
        snippet: 'return a + b',
      },

      existingJsDoc: {
        params: [],
        tags: [],
      },
      effectSignals: undefined,

      options: {
        preserveStyle: true,
      },
    }

    const plan = await runQAWithEnvOrThrow(executeJsDocUpdatePlan(context), layer)

    console.dir(plan, { depth: null })

    expect(plan[0]?.summary).toBeDefined()

    expect(plan[0]?.params.length).toBe(2)

    expect(plan[0]?.params.some((p) => p.name === 'a')).toBe(true)

    expect(plan[0]?.params.some((p) => p.name === 'b')).toBe(true)

    expect(plan[0]?.risk).toBeDefined()
  }, 60_000)
  test('prefers preserve when existing documentation already exists', async () => {
    const context: LightJsDocContext = {
      project: { name: 'simple test' },
      source: { relativePath: 'test/existing-jsdoc.ts' },

      mode: 'light',
      target: {
        signatureId: '(a: number, b: number) => number',
        symbolId: 'add',
      },
      symbol: {
        name: 'add',
        kind: 'function',
      },
      relatedSymbols: [],
      code: {
        //         declarationSnippet: `
        // export const add = (
        //   a: number,
        //   b: number,
        // ): number
        // `,
        snippet: 'return a + b',
      },

      existingJsDoc: {
        summary: 'Adds two numbers.',

        params: [
          {
            name: 'a',
            type: 'number',
            description: 'The first number.',
            sortOrder: 1,
          },
          {
            name: 'b',
            type: 'number',
            description: 'The second number.',
            sortOrder: 2,
          },
        ],

        returns: 'The sum of the two numbers.',

        tags: [],
      },
      effectSignals: undefined,

      options: {
        preserveStyle: true,
      },
    }

    const plan = await runQAWithEnvOrThrow(executeJsDocUpdatePlan(context), layer)

    console.dir(plan, { depth: null })

    expect(plan[0]?.summary.action.type).toBe('preserve')

    expect(plan[0]?.params.every((p) => p.action.type === 'preserve')).toBe(true)

    expect(plan[0]?.returns.action.type).toBe('preserve')
  }, 60_000)
})
