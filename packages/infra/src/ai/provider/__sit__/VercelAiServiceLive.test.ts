import { describe, expect, it } from 'vitest'
import { Effect, Layer, Schema } from 'effect'

import { makeRunner } from '@gyomu/schema/effect'
import { AiService } from '../../service/AiService.js'
import { AiServiceLive } from '../VercelAiServiceLive.js'

import { AI_MODELS } from '../../models/AiModels.js'
import { MainLayer, PlatformLayer } from '../../../layer.js'
import { ConfigLayer } from '../../../config.js'
import 'dotenv/config'
import type { AiTool } from '../../tool/ai-tool.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runVercelQAWithEnvOrThrow = makeRunner(AiServiceLive)
/**
 * =========================================
 * Test Guard
 * =========================================
 */

const describeIfApiKey = process.env.GEMINI_API_KEY ? describe : describe.skip

describeIfApiKey('VercelAiServiceLive Integration', () => {
  describe('generateText', () => {
    it('generates text', async () => {
      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiService
          return yield* service.generateText({
            model: AI_MODELS.fast,
            prompt: 'Return exactly: hello world',
          })
        }),
        layer,
      )
      console.log(result.text)
      expect(result.text).toContain('hello')
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
          const service = yield* AiService
          return yield* service.generateObject({
            model: AI_MODELS.fast,

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
          const service = yield* AiService
          return yield* service.embed({
            model: AI_MODELS.embedding,
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
          const service = yield* AiService
          return yield* service.streamText({
            model: AI_MODELS.fast,
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
      const weatherTool: AiTool<string, typeof citySchema, weatherType> = {
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
          const service = yield* AiService
          return yield* service.generateText({
            model: AI_MODELS.fast,
            prompt: 'What is the weather in Tokyo?',
            tools: [weatherTool],
            toolLoopPolicy: { type: 'maxSteps', maxSteps: 2 },
          })
        }),
        layer,
      )
      console.log('Output', JSON.stringify(result, null, 2))
      expect(result.text.toLowerCase()).toContain('sunny')
    }, 30_000)
  })
})
