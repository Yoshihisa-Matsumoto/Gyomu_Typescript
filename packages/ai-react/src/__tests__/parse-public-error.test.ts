import { describe, expect, it } from 'vitest'
import { parsePublicError } from '../parse-public-error.js'

describe('parsePublicError', () => {
  it('should parse valid public error', async () => {
    const response = new Response(
      JSON.stringify({
        code: 'temporary_unavailable',
        message: '一時的に利用できません',
        retryable: true,
      }),
      {
        status: 500,
      },
    )

    const result = await parsePublicError(response)

    expect(result).toEqual({
      code: 'temporary_unavailable',
      message: '一時的に利用できません',
      retryable: true,
    })
  })

  it('should return unexpected_failure when schema invalid', async () => {
    const response = new Response(
      JSON.stringify({
        invalid: true,
      }),
      {
        status: 500,
      },
    )

    const result = await parsePublicError(response)

    expect(result).toEqual({
      code: 'unexpected_failure',
      message: 'エラー応答の解析に失敗しました',
      retryable: false,
    })
  })

  it('should return unexpected_failure when json parse failed', async () => {
    const response = new Response('invalid-json', {
      status: 500,
    })

    const result = await parsePublicError(response)

    expect(result).toEqual({
      code: 'unexpected_failure',
      message: 'エラー応答の解析に失敗しました',
      retryable: false,
    })
  })
})
