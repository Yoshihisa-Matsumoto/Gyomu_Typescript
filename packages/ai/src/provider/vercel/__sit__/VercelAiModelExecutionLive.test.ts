import { describe, expect, it } from 'vitest'
import { Effect, Layer, Schema } from 'effect'

import { makeRunner } from '@gyomu/schema/effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'

import { MessageRole } from '@gyomu/schema/conversation'

import { AI_MODELS } from '../../../model/AiModels.js'
import 'dotenv/config'
import { VercelAiModelExecutionLive } from '../VercelAiModelExecutionLive.js'
import { AiModelExecution } from '../../types/AiModelExecuion.js'
import type { AiTool } from '../../../tool/ai-tool.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runVercelQAWithEnvOrThrow = makeRunner(VercelAiModelExecutionLive)
/**
 * =========================================
 * Test Guard
 * =========================================
 */

const describeIfApiKey = process.env.GEMINI_API_KEY ? describe : describe.skip

describeIfApiKey('VercelAiExecutionLive Integration', () => {
  describe('generateText', () => {
    it('generates text', async () => {
      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelExecution
          return yield* service.generateText(AI_MODELS, {
            key: 'fast',
            prompt: 'Return exactly: hello world',
          })
        }),
        layer,
      )
      console.log(result)
      expect(result.message.parts.find((m) => m.type == 'text')?.text).toContain('hello')
    }, 30_000)
  })

  describe('generateObject', () => {
    it('generates structured object', async () => {
      const UserSchema = Schema.Struct({
        name: Schema.String,
        age: Schema.Number,
      })

      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelExecution
          return yield* service.generateObject(AI_MODELS, {
            key: 'fast',

            schema: UserSchema,

            prompt: `
  Return a json object:
  name = john
  age = 20
  `,
          })
        }),
      )

      expect(result.object.name).toBeDefined()

      expect(typeof result.object.age).toBe('number')
    }, 30_000)
  })

  describe('embed', () => {
    it('generates embeddings', async () => {
      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelExecution
          return yield* service.embed(AI_MODELS, {
            value: 'hello world',
          })
        }),
      )

      expect(result.length).toBeGreaterThan(0)

      expect(typeof result[0]).toBe('number')
    }, 30_000)
  })

  describe('streamText', () => {
    it('streams text', async () => {
      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelExecution
          return yield* service.streamText(AI_MODELS, {
            key: 'fast',
            prompt: 'Say hello in one short sentence',
          })
        }),
      )

      let fullText = ''

      for await (const chunk of result.textStream) {
        fullText += chunk
      }

      expect(fullText.length).toBeGreaterThan(0)
    }, 30_000)
  })

  describe('tool', () => {
    it('text  tool ', async () => {
      const citySchema = Schema.Struct({ city: Schema.String })
      type weatherType = { weather: string }
      const weatherTool: AiTool<typeof citySchema, weatherType> = {
        name: 'weather',
        description: 'Get weather for city',
        inputSchema: citySchema,
        execute: async ({ city }) => {
          console.log('tool called')
          return await {
            success: true as const,

            data: {
              weather: `Sunny in ${city}`,
            },
          }
        },
      }
      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelExecution
          return yield* service.generateText(AI_MODELS, {
            key: 'fast',

            messages: [
              {
                id: '1',
                role: MessageRole.system,
                content: `You MUST use the weather tool whenever the user asks about weather.
Do not answer from your own knowledge.
If the tool is available, always call it first.`,
              },
              { id: '2', role: MessageRole.user, content: 'What is the weather in Tokyo?' },
            ],
            tools: [weatherTool],
            toolLoopPolicy: { type: 'maxSteps', maxSteps: 2 },
          })
        }),
        layer,
      )
      console.log('Output', JSON.stringify(result, null, 2))
      expect(result.message.parts.find((m) => m.type == 'text')?.text).toContain('sunny')
    }, 30_000)
  })
})
