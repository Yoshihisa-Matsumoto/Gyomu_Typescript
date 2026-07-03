import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Schema } from 'effect'

import { embed, generateText, streamText, APICallError } from 'ai'

import { makeRunner } from '@gyomu/schema/effect'
import { AiModelService } from '../../types/AiModelService.js'
import { VercelAiModelServiceLive } from '../VercelAiModelServiceLive.js'

const runVercelQAWithEnvOrThrow = makeRunner(VercelAiModelServiceLive)
/**
 * =========================================
 * Mock ai sdk
 * =========================================
 */

vi.mock('ai', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('ai')>()

  return {
    ...actual,
    generateText: vi.fn(),
    streamText: vi.fn(),
    embed: vi.fn(),
    Output: {
      object: vi.fn((x) => x),
    },
  }
})

/**
 * =========================================
 * Helpers
 * =========================================
 */

const mockModel = {
  modelId: 'test-model',
} as any

describe('VercelAiServiceLive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateText', () => {
    it('returns generated text result', async () => {
      vi.mocked(generateText).mockResolvedValue({
        text: 'hello',
      } as any)

      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelService
          return yield* service.generateText({
            model: mockModel,
            prompt: 'hi',
          })
        }),
      )

      expect(result.message.parts.find((m) => m.type == 'text')?.text).toBe('hello')

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'hi',
        }),
      )
    })

    it('throws AiError when generateText fails', async () => {
      vi.mocked(generateText).mockRejectedValue(new Error('boom'))

      await expect(
        runVercelQAWithEnvOrThrow(
          Effect.gen(function* () {
            const service = yield* AiModelService
            return yield* service.generateText({
              model: mockModel,
              prompt: 'hi',
            })
          }),
        ),
      ).rejects.toMatchObject({
        message: 'Unknown Error',
      })
    })
  })

  describe('generateObject', () => {
    it('returns structured object', async () => {
      vi.mocked(generateText).mockResolvedValue({
        output: {
          name: 'john',
        },

        text: '{"name":"john"}',
      } as any)

      const UserSchema = Schema.Struct({
        name: Schema.String,
      })

      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelService
          return yield* service.generateObject({
            model: mockModel,
            prompt: 'generate user',
            schema: UserSchema,
          })
        }),
      )

      expect(result.object).toEqual({
        name: 'john',
      })

      expect(result.text).toBe('{"name":"john"}')
    })
  })

  describe('embed', () => {
    it('returns embedding vector', async () => {
      vi.mocked(embed).mockResolvedValue({
        embedding: [1, 2, 3],
      } as any)

      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelService
          return yield* service.embed({
            model: mockModel,
            value: 'hello',
          })
        }),
      )

      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('streamText', () => {
    it('returns stream result', async () => {
      vi.mocked(streamText).mockReturnValue({
        textStream: 'stream',
      } as any)

      const result = await runVercelQAWithEnvOrThrow(
        Effect.gen(function* () {
          const service = yield* AiModelService
          return yield* service.streamText({
            model: mockModel,
            prompt: 'hi',
          })
        }),
      )

      expect(result.textStream).toBe('stream')
    })
  })
})
