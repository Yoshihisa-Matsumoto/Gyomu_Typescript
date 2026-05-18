import { describe, expect, it, vi } from 'vitest'
import { Effect, Schema } from 'effect'

import * as ai from 'ai'
import { makeAiService } from '../VercelAiServiceLive.js'
import type { AiTool } from '../../tool/ai-tool.js'

vi.mock('ai', () => ({
  generateText: vi.fn(),

  streamText: vi.fn(),

  embed: vi.fn(),

  Output: {
    object: vi.fn(),
  },

  tool: vi.fn((x) => x),
}))
const generateTextMock = vi.mocked(ai.generateText) as any
const InputSchema = Schema.Struct({
  name: Schema.String,
})

const outputDataSchema = Schema.Struct({
  message: Schema.String,
})

// const OutputSchema = createResultSchema(outputDataSchema)

const execute = vi.fn(
  async () =>
    await {
      success: true as const,
      data: {
        message: 'hello',
      },
    },
)

const testTool: AiTool<string, typeof InputSchema, typeof outputDataSchema> = {
  name: 'testTool',

  description: 'test',

  inputSchema: InputSchema,

  execute,
}

describe('generateText tool support', () => {
  it('passes tools to generateText', async () => {
    generateTextMock.mockResolvedValue({
      text: 'hello',
    })

    const service = makeAiService()

    await Effect.runPromise(
      service.generateText({
        model: 'gpt-4o-mini' as any,

        prompt: 'hello',

        tools: [testTool],
      }),
    )

    expect(generateTextMock).toHaveBeenCalled()

    const args = generateTextMock.mock.calls[0]?.[0]

    expect(args?.tools).toBeDefined()

    expect(args?.tools.testTool).toBeDefined()
  })
})
