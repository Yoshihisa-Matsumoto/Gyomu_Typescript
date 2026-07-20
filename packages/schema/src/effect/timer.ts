import { Duration, Effect } from 'effect'
import { TimeoutError } from '../error/TimeoutError.js'

/**
 * Executes an effect-based polling operation that repeatedly calls a function until it returns true or a timeout is reached.
 *
 * @param pollingActionName explanation of this aciton during polling
 *
 * @param timeoutSeconds The maximum duration in seconds to continue polling.
 *
 * @param intervalSeconds The delay in seconds between polling attempts.
 *
 * @param timerFunc The effectful function to execute during each poll.
 *
 * @param args Arguments to pass to the timer function.
 *
 * @returns Returns an Effect that resolves to true if the polling succeeds within the timeout, or false if the timeout is reached. Fails with a TimeoutError if an error occurs during execution.
 *
 * @template R
 */
export const polling = <R = never>(
  pollingActionName: string,
  timeoutSeconds: number,
  intervalSeconds: number,
  timerFunc: (...args: Array<any>) => Effect.Effect<boolean, unknown, R>,
  ...args: Array<any>
): Effect.Effect<boolean, TimeoutError, R> =>
  Effect.gen(function* () {
    const start = Date.now()
    const timeoutTime = start + timeoutSeconds * 1000

    const poll = (): Effect.Effect<boolean, TimeoutError, R> =>
      Effect.gen(function* () {
        const result = yield* timerFunc(...args).pipe(
          Effect.mapError(
            (e) =>
              new TimeoutError({
                message: `Fail on polling: ${pollingActionName}`,
                action: pollingActionName,
                timeoutSeconds,
                intervalSeconds,
                cause: e,
              }),
          ),
        )

        if (result) {
          return true
        }

        if (Date.now() > timeoutTime) {
          // return yield* Effect.fail(
          //   new TimeoutError({
          //     message: `Timeout on polling: ${pollingActionName}`,
          //     action: pollingActionName,
          //     timeoutSeconds,
          //     intervalSeconds,
          //     elapsedMs: Date.now() - start,
          //     cause: undefined,
          //   }),
          // );
          return false
        }

        yield* Effect.sleep(Duration.seconds(intervalSeconds))

        return yield* poll()
      })

    return yield* poll()
  })

/**
 * Pauses execution for a specified duration in seconds.
 *
 * @param second Duration to sleep in seconds.
 *
 * @returns A promise that resolves after the specified duration.
 */
export const sleep = async (second: number) => {
  await new Promise((resolve) => setTimeout(resolve, second * 1000))
}
