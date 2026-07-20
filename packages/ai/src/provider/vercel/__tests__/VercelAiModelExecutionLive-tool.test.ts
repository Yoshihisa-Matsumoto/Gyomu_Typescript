import { describe, expect, it, vi } from 'vitest'
import { Effect, Schema } from 'effect'

import * as ai from 'ai'
import { makeAiModelExecution } from '../VercelAiModelExecutionLive.js'
import type { AiModelRegistry } from '../../../model/AiModels.js'
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

    const service = makeAiModelExecution()

    await Effect.runPromise(
      service.generateText(mockRegistry, {
        key: 'fast',

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
