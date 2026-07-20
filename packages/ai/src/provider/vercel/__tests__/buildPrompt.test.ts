import { describe, expect, it } from 'vitest'
import { AiError } from '@gyomu/schema'
import { MessageRole } from '@gyomu/schema/conversation'
import { buildPrompt } from '../buildPrompt.js'

describe('buildPrompt', () => {
  it('returns prompt when prompt is provided', () => {
    const result = buildPrompt({
      prompt: 'hello world',
    })

    expect(result).toEqual({
      prompt: 'hello world',
    })
  })

  it('returns mapped messages when messages are provided', () => {
    const result = buildPrompt({
      messages: [
        {
          id: 'aa',
          role: MessageRole.user,
          content: 'hello',
        },
        {
          id: 'ab',
          role: MessageRole.assistant,
          content: 'hi',
        },
      ],
    })

    expect(result).toEqual({
      messages: [
        {
          role: 'user',
          content: 'hello',
        },
        {
          role: 'assistant',
          content: 'hi',
        },
      ],
    })
  })

  it('prioritizes messages over prompt when both are provided', () => {
    const result = buildPrompt({
      prompt: 'prompt text',
      messages: [
        {
          id: 'aa',
          role: MessageRole.user,
          content: 'message text',
        },
      ],
    })

    expect(result).toEqual({
      messages: [
        {
          role: 'user',
          content: 'message text',
        },
      ],
    })
  })

  it('returns empty messages array when messages is empty', () => {
    const result = buildPrompt({
      messages: [],
    })

    expect(result).toEqual({
      messages: [],
    })
  })

  it('throws AiError when neither prompt nor messages is provided', () => {
    expect(() => buildPrompt({})).toThrow(AiError)

    expect(() => buildPrompt({})).toThrow('prompt or messages is required')
  })

  it('throws AiError with expected properties', () => {
    try {
      buildPrompt({})
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(AiError)
      expect(error).toMatchObject({
        message: 'prompt or messages is required',
        operation: 'generate',
        model: 'unknown',
        phase: 'request',
        isRetryable: false,
      })
    }
  })
})
