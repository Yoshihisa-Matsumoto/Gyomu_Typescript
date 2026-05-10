import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Stream } from 'effect'

import { NetworkError } from '@gyomu/core'
import { webDownloadStream } from '../download.js'

// ===== import mocked =====
import { fetchEffect } from '../client.js'
import { networkStream } from '../../network/index.js'

// ===== mock =====
vi.mock('../client.js', () => ({
  fetchEffect: vi.fn(),
}))

vi.mock('../../network/index.js', () => ({
  networkStream: vi.fn(),
}))

describe('webDownloadStream', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('正常系: streamがそのまま流れる', async () => {
    const mockBody = {} as any

    vi.mocked(fetchEffect).mockReturnValue(
      Effect.succeed({
        body: mockBody,
      } as any),
    )

    // Uint8Arrayを流すStreamを返す
    const mockStream = Stream.fromIterable([new Uint8Array([1, 2]), new Uint8Array([3, 4])])

    vi.mocked(networkStream).mockReturnValue(mockStream)

    const result = await Effect.runPromise(Stream.runCollect(webDownloadStream('url')))

    expect(result).toEqual([new Uint8Array([1, 2]), new Uint8Array([3, 4])])
  })

  it('bodyがない場合はNetworkError', async () => {
    vi.mocked(fetchEffect).mockReturnValue(
      Effect.succeed({
        body: null,
      } as any),
    )

    await expect(
      Effect.runPromise(Stream.runCollect(webDownloadStream('url'))),
    ).rejects.toBeInstanceOf(NetworkError)
  })

  it('fetchEffectが失敗したらそのままfail', async () => {
    vi.mocked(fetchEffect).mockReturnValue(
      Effect.fail(
        new NetworkError({
          message: 'fetch fail',
          cause: undefined,
          operation: 'download',
          retryable: false,
        }),
      ),
    )

    await expect(
      Effect.runPromise(Stream.runCollect(webDownloadStream('url'))),
    ).rejects.toBeInstanceOf(NetworkError)
  })
})
