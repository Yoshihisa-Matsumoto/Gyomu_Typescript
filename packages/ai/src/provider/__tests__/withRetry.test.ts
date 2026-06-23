import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'
import { AiError } from '@gyomu/schema'
import { withRetry } from '../withRetry.js'

describe('withRetry', () => {
  it('should not retry when error is not retryable', async () => {
    let count = 0

    const effect = Effect.gen(function* () {
      count++

      return yield* Effect.fail(
        new AiError({
          message: 'invalid request',
          operation: 'generate',
          model: 'test',
          phase: 'request',
          retryable: false,
          cause: undefined,
          retryStrategy: { _tag: 'none' },
        }),
      )
    })

    await expect(Effect.runPromise(withRetry(effect))).rejects.toThrow()

    expect(count).toBe(1)
  })

  it('should retry after rate limit', async () => {
    let count = 0

    const effect = Effect.gen(function* () {
      count++

      if (count === 1) {
        return yield* Effect.fail(
          new AiError({
            message: 'rate limit',
            operation: 'generate',
            model: 'test',
            phase: 'rate-limit',
            retryable: true,
            retryStrategy: {
              _tag: 'retry-after',
              delayMs: 1,
            },
            cause: undefined,
          }),
        )
      }

      return 'success'
    })

    const result = await Effect.runPromise(withRetry(effect))

    expect(result).toBe('success')
    expect(count).toBe(2)
  })

  it('should retry retryable errors', async () => {
    let count = 0

    const effect = Effect.gen(function* () {
      count++

      if (count < 3) {
        return yield* Effect.fail(
          new AiError({
            message: 'temporary failure',
            operation: 'generate',
            model: 'test',
            phase: 'request',
            retryable: true,
            cause: undefined,
            retryStrategy: { _tag: 'exponential' },
          }),
        )
      }

      return 'success'
    })

    const result = await Effect.runPromise(withRetry(effect, { maxAttempts: 5 }))

    expect(result).toBe('success')
    expect(count).toBe(3)
  })

  it('should fail after max retries', async () => {
    let count = 0

    const effect = Effect.gen(function* () {
      count++
      console.log(count)
      return yield* Effect.fail(
        new AiError({
          message: 'temporary failure',
          operation: 'generate',
          model: 'test',
          phase: 'request',
          retryable: true,
          cause: undefined,
          retryStrategy: { _tag: 'exponential' },
        }),
      )
    })

    await expect(Effect.runPromise(withRetry(effect, { maxAttempts: 2 }))).rejects.toThrow()

    expect(count).toBeGreaterThanOrEqual(3)
  })

  it('should keep retrying repeated rate limits', async () => {
    let count = 0

    const effect = Effect.gen(function* () {
      count++

      if (count <= 3) {
        return yield* Effect.fail(
          new AiError({
            message: 'rate limit',
            operation: 'generate',
            model: 'test',
            phase: 'rate-limit',
            retryable: true,
            cause: undefined,
            retryStrategy: {
              _tag: 'retry-after',
              delayMs: 1,
            },
          }),
        )
      }

      return 'success'
    })

    const result = await Effect.runPromise(withRetry(effect))

    expect(result).toBe('success')
    expect(count).toBe(4)
  })
})
