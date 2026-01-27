import { BaseError, TimeoutError } from './errors';
import {ResultAsync} from './result'
/**
 *
 * @param pollingActionName
 * explanation of this aciton during polling
 * @returns
 * Return success(true) when it's good result in polling. Otherwise return success(false)
 * Return Failure with TimeoutError if there is any unexpected error
 */
export function polling<E extends BaseError>(
  pollingActionName: string,
  timeoutSeconds: number,
  intervalSeconds: number,
  timerFunc: (...args: any[]) => ResultAsync<boolean, E>,
  ...args: any[]
): ResultAsync<boolean, TimeoutError> {

  const timeoutTime = Date.now() + timeoutSeconds * 1000;

  const poll = async (): Promise<boolean> => {
    const result = await timerFunc(...args);

    if (result.isErr()) {
      throw new TimeoutError(
        `Fail on polling: ${pollingActionName}`,
        result.error
      );
    }

    if (result.value) {
      return true;
    }

    if (Date.now() > timeoutTime) {
      return false;
    }

    await new Promise(resolve =>
      setTimeout(resolve, intervalSeconds * 1000)
    );

    return poll();
  };

  return ResultAsync.fromPromise(
    poll(),
    (e) =>
      e instanceof TimeoutError
        ? e
        : new TimeoutError(`Fail on polling: ${pollingActionName}`, e)
  );
}

export const sleep = (ms: number) => {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
};