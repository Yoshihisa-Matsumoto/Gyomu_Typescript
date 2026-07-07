import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Schema } from 'effect'

import { embed, generateText, streamText } from 'ai'

import { makeRunner } from '@gyomu/schema/effect'
import { VercelAiModelExecutionLive } from '../VercelAiModelExecutionLive.js'
import { AiModelExecution } from '../../types/AiModelExecuion.js'
import type { AiModelRegistry } from '../../../model/AiModels.js'

const runVercelQAWithEnvOrThrow = makeRunner(VercelAiModelExecutionLive)
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

const mockRegistry: AiModelRegistry = {
  fast: mockModel,
  embedding: mockModel,
  reasoning: mockModel,
  smart: mockModel,
  vision: mockModel,
}

describe('VercelAiModelExecutionLive', () => {
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
          const service = yield* AiModelExecution
          return yield* service.generateText(mockRegistry, {
            key: 'fast',
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
            const service = yield* AiModelExecution
            return yield* service.generateText(mockRegistry, {
              key: 'fast',
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
          const service = yield* AiModelExecution
          return yield* service.generateObject(mockRegistry, {
            key: 'fast',
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
          const service = yield* AiModelExecution
          return yield* service.embed(mockRegistry, {
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
          const service = yield* AiModelExecution
          return yield* service.streamText(mockRegistry, {
            key: 'fast',
            prompt: 'hi',
          })
        }),
      )

      expect(result.textStream).toBe('stream')
    })
  })
})
