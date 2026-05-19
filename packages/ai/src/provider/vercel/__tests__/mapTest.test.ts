import { describe, expect, it } from 'vitest'
import { mapGenerateTextResultToAiGenerateTextResult, mapVercelFinishReason } from '../mapResult.js'
import type { LanguageModelUsage } from 'ai'

describe('mapVercelFinishReason', () => {
  it('maps stop to completed', () => {
    expect(mapVercelFinishReason('stop')).toBe('completed')
  })

  it('maps length to max-tokens', () => {
    expect(mapVercelFinishReason('length')).toBe('max-tokens')
  })

  it('maps tool-calls to tool-call', () => {
    expect(mapVercelFinishReason('tool-calls')).toBe('tool-call')
  })

  it('maps content-filter to content-filtered', () => {
    expect(mapVercelFinishReason('content-filter')).toBe('content-filtered')
  })

  it('maps error to error', () => {
    expect(mapVercelFinishReason('error')).toBe('error')
  })

  it('maps undefined to unknown', () => {
    expect(mapVercelFinishReason(undefined)).toBe('unknown')
  })

  it('maps unknown values to unknown', () => {
    expect(mapVercelFinishReason('other')).toBe('unknown')
  })
})

describe('mapGenerateTextResultToAiGenerateTextResult', () => {
  it('maps text result', () => {
    const result = mapGenerateTextResultToAiGenerateTextResult({
      text: 'hello',
      toolCalls: [],
      usage: {
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      } as any as LanguageModelUsage,
      finishReason: 'stop',
    })

    expect(result).toEqual({
      message: {
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'hello',
          },
        ],
        text: 'hello',
      },
      usage: {
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      },
      finishReason: 'completed',
    })
  })

  it('maps tool calls', () => {
    const result = mapGenerateTextResultToAiGenerateTextResult({
      text: '',
      toolCalls: [
        {
          toolName: 'weather',
          toolCallId: 'call-1',
          input: {
            city: 'Tokyo',
          },
        },
      ],
      usage: undefined,
      finishReason: 'tool-calls',
    } as any)

    expect(result).toEqual({
      message: {
        role: 'assistant',
        parts: [
          {
            type: 'tool-call',
            toolName: 'weather',
            toolCallId: 'call-1',
            input: {
              city: 'Tokyo',
            },
          },
        ],
        text: '',
      },
      finishReason: 'tool-call',
    })
  })

  it('maps both text and tool calls preserving order', () => {
    const result = mapGenerateTextResultToAiGenerateTextResult({
      text: 'calling tool',
      toolCalls: [
        {
          toolName: 'weather',
          toolCallId: 'call-1',
          input: {
            city: 'Tokyo',
          },
        },
      ],
      usage: {
        inputTokens: 1,
        outputTokens: 2,
        totalTokens: 3,
      },
      finishReason: 'tool-calls',
    } as any)

    expect(result).toEqual({
      message: {
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'calling tool',
          },
          {
            type: 'tool-call',
            toolName: 'weather',
            toolCallId: 'call-1',
            input: {
              city: 'Tokyo',
            },
          },
        ],
        text: 'calling tool',
      },
      usage: {
        inputTokens: 1,
        outputTokens: 2,
        totalTokens: 3,
      },
      finishReason: 'tool-call',
    })
  })

  it('defaults missing usage token values to 0', () => {
    const result = mapGenerateTextResultToAiGenerateTextResult({
      text: 'hello',
      toolCalls: [],
      usage: {
        inputTokens: undefined,
        outputTokens: undefined,
        totalTokens: 100,
      },
      finishReason: 'length',
    } as any)

    expect(result).toEqual({
      message: {
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'hello',
          },
        ],
        text: 'hello',
      },
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 100,
      },
      finishReason: 'max-tokens',
    })
  })

  it('omits usage when usage is undefined', () => {
    const result = mapGenerateTextResultToAiGenerateTextResult({
      text: 'hello',
      toolCalls: [],
      usage: undefined,
      finishReason: 'stop',
    } as any)

    expect(result).toEqual({
      message: {
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'hello',
          },
        ],
        text: 'hello',
      },
      finishReason: 'completed',
    })
  })

  it('returns empty parts when text and toolCalls are empty', () => {
    const result = mapGenerateTextResultToAiGenerateTextResult({
      text: '',
      toolCalls: [],
      usage: undefined,
      finishReason: undefined,
    } as any)

    expect(result).toEqual({
      message: {
        role: 'assistant',
        parts: [],
        text: '',
      },
      finishReason: 'unknown',
    })
  })
})
