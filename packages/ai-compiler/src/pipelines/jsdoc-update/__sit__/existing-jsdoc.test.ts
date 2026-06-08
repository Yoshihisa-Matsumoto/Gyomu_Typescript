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
  test('slightly different jsdoc expects replacement in summary', async () => {
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
        summary: 'Adds three numbers.',

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

      options: {
        preserveStyle: true,
      },
    }

    const plan = await runQAWithEnvOrThrow(executeJsDocUpdatePlan(context), layer)

    console.dir(plan, { depth: null })

    expect(plan[0]?.summary.action.type).toBe('replace')

    expect(plan[0]?.params.every((p) => p.action.type === 'preserve')).toBe(true)

    expect(plan[0]?.returns.action.type).toBe('preserve')
  }, 60_000)
  test('deletes parameter documentation for removed parameter', async () => {
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
          {
            name: 'removedParam',
            type: 'number',
            description: 'No longer exists.',
            sortOrder: 3,
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

    const removedParamPlan = plan[0]?.params.find((p) => p.name === 'removedParam')

    expect(removedParamPlan).toBeDefined()

    expect(removedParamPlan?.action.type).toBe('delete')
  }, 60_000)
})
