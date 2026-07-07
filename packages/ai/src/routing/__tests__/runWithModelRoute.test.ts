import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'

import { runWithModelRoute } from '../runWithModelRoute.js'
import type { AiModelRegistry } from '../../model/AiModels.js'
import type { AiError } from '@gyomu/schema'
import type { ModelRoute } from '../ModelRoute.js'

const registry1 = {} as AiModelRegistry
const registry2 = {} as AiModelRegistry

const route: ModelRoute = {
  nodes: [
    { registry: registry1, retry: 3 },
    { registry: registry2, retry: 5 },
  ],
}

describe('runWithModelRoute', () => {
  it('returns immediately when first node succeeds', async () => {
    const execute = vi.fn((registry: AiModelRegistry) => Effect.succeed(registry))

    const result = await Effect.runPromise(runWithModelRoute(route, execute))

    expect(result).toBe(registry1)
    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenNthCalledWith(1, registry1)
  })

  it('falls back to next node when error is retryable', async () => {
    const error = {
      canFallback: true,
    } as AiError

    const execute = vi
      .fn()
      .mockImplementationOnce(() => Effect.fail(error))
      .mockImplementationOnce((registry: AiModelRegistry) => Effect.succeed(registry))

    const result = await Effect.runPromise(runWithModelRoute(route, execute))

    expect(result).toBe(registry2)
    expect(execute).toHaveBeenCalledTimes(2)
  })
  it('does not continue when fallback is disabled', async () => {
    const error = {
      canFallback: false,
    } as AiError

    const execute = vi
      .fn()
      .mockImplementationOnce(() => Effect.fail(error))
      .mockImplementationOnce(() => Effect.succeed(registry2))

    const actual = await Effect.runPromise(runWithModelRoute(route, execute).pipe(Effect.flip))

    expect(actual).toBe(error)
    expect(execute).toHaveBeenCalledTimes(1)
  })
  it('returns last error when all nodes fail', async () => {
    const error1 = {
      canFallback: true,
    } as AiError

    const error2 = {
      canFallback: true,
    } as AiError

    const execute = vi
      .fn()
      .mockImplementationOnce(() => Effect.fail(error1))
      .mockImplementationOnce(() => Effect.fail(error2))

    const actual = await Effect.runPromise(runWithModelRoute(route, execute).pipe(Effect.flip))

    expect(actual).toBe(error2)
    expect(execute).toHaveBeenCalledTimes(2)
  })
})
