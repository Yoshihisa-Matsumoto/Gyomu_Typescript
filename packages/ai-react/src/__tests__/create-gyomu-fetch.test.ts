import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGyomuFetch } from '../create-gyomu-fetch.js'
import { PublicErrorException } from '../public-error.exception.js'

describe('createGyomuFetch', () => {
  const gyomuFetch = createGyomuFetch()

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should return response when fetch success', async () => {
    const response = new Response('ok', {
      status: 200,
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

    const result = await gyomuFetch('/api/test')

    expect(result).toBe(response)
  })

  it('should throw PublicErrorException when response not ok', async () => {
    const response = new Response(
      JSON.stringify({
        code: 'temporary_unavailable',
        message: '一時エラー',
        retryable: true,
      }),
      {
        status: 500,
      },
    )

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

    await expect(gyomuFetch('/api/test')).rejects.toBeInstanceOf(PublicErrorException)
  })

  it('should convert invalid response to unexpected_failure', async () => {
    const response = new Response(
      JSON.stringify({
        invalid: true,
      }),
      {
        status: 500,
      },
    )

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

    await expect(gyomuFetch('/api/test')).rejects.toMatchObject({
      publicError: {
        code: 'unexpected_failure',
      },
    })
  })

  it('should convert network error to unexpected_failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'))

    await expect(gyomuFetch('/api/test')).rejects.toMatchObject({
      publicError: {
        code: 'unexpected_failure',
        message: '予期しないエラーが発生しました',
      },
    })
  })

  it('should preserve PublicErrorException', async () => {
    const response = new Response(
      JSON.stringify({
        code: 'temporary_unavailable',
        message: '一時エラー',
        retryable: true,
      }),
      {
        status: 500,
      },
    )

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

    try {
      await gyomuFetch('/api/test')
    } catch (error) {
      expect(error).toBeInstanceOf(PublicErrorException)

      if (error instanceof PublicErrorException) {
        expect(error.publicError.code).toBe('temporary_unavailable')
      }
    }
  })
})
