import { TimeoutError } from './errors';
import { GyomuResultAsync, runAsync } from './result';
/**
 *
 * @param pollingActionName
 * explanation of this aciton during polling
 * @returns
 * Return success(true) when it's good result in polling. Otherwise return success(false)
 * Return Failure with TimeoutError if there is any unexpected error
 */
export function polling(
  pollingActionName: string,
  timeoutSeconds: number,
  intervalSeconds: number,
  timerFunc: (...args: any[]) => GyomuResultAsync<boolean>,
  ...args: any[]
): GyomuResultAsync<boolean> {
  const timeoutTime = Date.now() + timeoutSeconds * 1000;

  const poll = async (): Promise<boolean> => {
    const result = await timerFunc(...args);

    if (result.isErr()) {
      throw new TimeoutError(
        `Fail on polling: ${pollingActionName}`,
        result.error,
      );
    }

    if (result.value) {
      return true;
    }

    if (Date.now() > timeoutTime) {
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));

    return poll();
  };

  return runAsync(poll, TimeoutError, `Fail on polling: ${pollingActionName}`);
}

export const sleep = async (second: number) => {
  await new Promise((resolve) => setTimeout(resolve, second * 1000));
};
