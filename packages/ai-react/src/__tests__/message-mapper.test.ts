import { describe, expect, it } from 'vitest'
import {
  getPlainTextFromUiMessage,
  mapAiSdkMessageToGyomuMessage,
  mapStatus,
} from '../message-mapper.js'

describe('message mapper', () => {
  it('should extract plain text', () => {
    const result = getPlainTextFromUiMessage({
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'こんにちは',
        },
      ],
    } as any)

    expect(result).toBe('こんにちは')
  })

  it('should map sdk message', () => {
    const result = mapAiSdkMessageToGyomuMessage({
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'hello',
        },
      ],
    } as any)

    expect(result).toEqual({
      id: '1',
      role: 'assistant',
      content: 'hello',
    })
  })

  it('should map status', () => {
    expect(mapStatus('submitted')).toBe('submitting')
    expect(mapStatus('streaming')).toBe('streaming')
    expect(mapStatus('error')).toBe('error')
    expect(mapStatus('unknown')).toBe('idle')
  })
})
