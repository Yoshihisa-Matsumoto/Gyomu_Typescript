import { describe, expect, it, vi } from 'vitest'
import { Effect, Schema } from 'effect'

import * as ai from 'ai'
import { makeAiService } from '../VercelAiModelServiceLive.js'
import type { AiTool } from '../../../tool/ai-tool.js'

vi.mock('ai', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('ai')>()

  return {
    ...actual,

    generateText: vi.fn(),
    streamText: vi.fn(),
    embed: vi.fn(),

    Output: {
      ...actual.Output,
      object: vi.fn(),
    },

    tool: actual.tool, // ← ここ重要（むやみに壊さない）
  }
})
const generateTextMock = vi.mocked(ai.generateText) as any
const InputSchema = Schema.Struct({
  name: Schema.String,
})

type outputDataType = {
  message: string
}

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

const testTool: AiTool<typeof InputSchema, outputDataType> = {
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
        toolLoopPolicy: { type: 'untilFinished' },
      }),
    )

    expect(generateTextMock).toHaveBeenCalled()

    const args = generateTextMock.mock.calls[0]?.[0]

    expect(args?.tools).toBeDefined()

    expect(args?.tools.testTool).toBeDefined()
  })
})
