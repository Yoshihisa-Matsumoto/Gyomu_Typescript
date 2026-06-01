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
  test('prefers preserve when existing documentation already exists', async () => {
    const context: LightJsDocContext = {
      project: { name: 'simple test' },
      source: { relativePath: 'test/existing-jsdoc.ts' },

      mode: 'light',

      symbol: {
        name: 'add',
        kind: 'function',
        signature: '(a: number, b: number) => number',
      },

      code: {
        fullSnippet: `
/**
 * Adds two numbers.
 *
 * @param a The first number.
 * @param b The second number.
 * @returns The sum of the two numbers.
 */
export const add = (
  a: number,
  b: number,
): number => a + b
`,
        bodySnippet: 'return a + b',
      },

      existingJsDoc: {
        summary: 'Adds two numbers.',

        params: [
          {
            name: 'a',
            type: 'number',
            description: 'The first number.',
          },
          {
            name: 'b',
            type: 'number',
            description: 'The second number.',
          },
        ],

        returns: 'The sum of the two numbers.',

        tags: [],
      },

      options: {
        preserveStyle: true,
      },
    }

    const plan = await runQAWithEnvOrThrow(executeJsDocUpdatePlan(context), layer)

    console.dir(plan, { depth: null })

    expect(plan.summary.action).toBe('preserve')

    expect(plan.params.every((p) => p.action === 'preserve')).toBe(true)

    expect(plan.returns.action).toBe('preserve')
  }, 60_000)
  test('slightly different jsdoc expects replacement in summary', async () => {
    const context: LightJsDocContext = {
      project: { name: 'simple test' },
      source: { relativePath: 'test/existing-jsdoc.ts' },

      mode: 'light',

      symbol: {
        name: 'add',
        kind: 'function',
        signature: '(a: number, b: number) => number',
      },

      code: {
        fullSnippet: `
/**
 * Adds three numbers.
 *
 * @param a The first number.
 * @param b The second number.
 * @returns The sum of the two numbers.
 */
export const add = (
  a: number,
  b: number,
): number => a + b
`,
        bodySnippet: 'return a + b',
      },

      existingJsDoc: {
        summary: 'Adds two numbers.',

        params: [
          {
            name: 'a',
            type: 'number',
            description: 'The first number.',
          },
          {
            name: 'b',
            type: 'number',
            description: 'The second number.',
          },
        ],

        returns: 'The sum of the two numbers.',

        tags: [],
      },

      options: {
        preserveStyle: true,
      },
    }

    const plan = await runQAWithEnvOrThrow(executeJsDocUpdatePlan(context), layer)

    console.dir(plan, { depth: null })

    expect(plan.summary.action).toBe('replace')

    expect(plan.params.every((p) => p.action === 'preserve')).toBe(true)

    expect(plan.returns.action).toBe('preserve')
  }, 60_000)
})
