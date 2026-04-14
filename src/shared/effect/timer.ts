import { Duration, Effect } from 'effect';
import { TimeoutError } from '../../errors.js';
/**
 *
 * @param pollingActionName
 * explanation of this aciton during polling
 * @returns
 * Return success(true) when it's good result in polling. Otherwise return success(false)
 * Return Failure with TimeoutError if there is any unexpected error
 */
export const polling = <R = never>(
  pollingActionName: string,
  timeoutSeconds: number,
  intervalSeconds: number,
  timerFunc: (...args: any[]) => Effect.Effect<boolean, unknown, R>,
  ...args: any[]
): Effect.Effect<boolean, TimeoutError, R> =>
  Effect.gen(function* () {
    const timeoutTime = Date.now() + timeoutSeconds * 1000;

    const poll = (): Effect.Effect<boolean, TimeoutError, R> =>
      Effect.gen(function* () {
        const result = yield* timerFunc(...args).pipe(
          Effect.mapError(
            (e) => new TimeoutError(`Fail on polling: ${pollingActionName}`, e),
          ),
        );

        if (result) {
          return true;
        }

        if (Date.now() > timeoutTime) {
          return false;
        }

        yield* Effect.sleep(Duration.seconds(intervalSeconds));

        return yield* poll();
      });

    return yield* poll();
  });

export const sleep = async (second: number) => {
  await new Promise((resolve) => setTimeout(resolve, second * 1000));
};
