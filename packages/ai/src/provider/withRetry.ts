import { Duration, Effect } from 'effect'
import { withOptional } from '@gyomu/schema'
import type { AiError, RetryObserver, RetryOption } from '@gyomu/schema'

/**
 * Wraps an effect with a retry mechanism based on the provided configuration.
 *
 * @param effect The effect to execute with retries.
 *
 * @param option Optional configuration for the retry behavior.
 *
 * @returns An effect that performs the operation with retry logic applied.
 */
export const withRetry = <A>(
  effect: Effect.Effect<A, AiError>,
  option?: RetryOption,
): Effect.Effect<A, AiError> => {
  return retryLoop(effect, {
    attempt: 0,
    maxAttempts: option?.maxAttempts ?? 5,
    ...withOptional({ observer: option?.observer }),
  })
}

interface RetryState {
  readonly attempt: number
  readonly maxAttempts: number
  readonly observer?: RetryObserver
}

const retryLoop = <A>(
  effect: Effect.Effect<A, AiError>,
  state: RetryState,
): Effect.Effect<A, AiError> =>
  Effect.catch(effect, (error) => {
    if (!error.isRetryable) {
      return Effect.fail(error)
    }

    if (state.attempt >= state.maxAttempts) {
      return Effect.fail(error)
    }

    if (error.resolution._tag != 'retry') return Effect.fail(error)
    const stragegy = error.resolution.strategy
    switch (stragegy._tag) {
      case 'retry-after':
        // console.log(`Retry afet ${error.retryStrategy.delayMs} ms`)
        if (state.observer) {
          state.observer.onRetry({
            error,
            attempt: state.attempt,
            delayMs: stragegy.delayMs,
          })
        }
        return Effect.sleep(Duration.millis(stragegy.delayMs)).pipe(
          Effect.andThen(
            retryLoop(effect, {
              ...state,
              attempt: state.attempt + 1,
            }),
          ),
        )

      case 'exponential': {
        const delayMs = Math.min(1000 * Math.pow(2, state.attempt), 60000)
        if (state.observer) {
          state.observer.onRetry({
            error,
            attempt: state.attempt,
            delayMs,
          })
        }
        return Effect.sleep(Duration.millis(delayMs)).pipe(
          Effect.andThen(
            retryLoop(effect, {
              ...state,
              attempt: state.attempt + 1,
            }),
          ),
        )
      }
      default: {
        return Effect.fail(error)
      }
    }
  })
