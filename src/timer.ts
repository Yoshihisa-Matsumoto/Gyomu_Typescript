import { resolve } from 'path';
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
  timerFunc: (...args: any) => ResultAsync<boolean, E>,
  ...args: any
):ResultAsync<boolean, TimeoutError> {
  const timeoutTime = new Date().getTime() + timeoutSeconds * 1000;

  return ResultAsync.fromSafePromise(new Promise(async (resolve, reject) => {
    try {
      const result = await timerFunc(...args);
      if (result.isErr()) {
        return reject(
          new TimeoutError(
              `Fail on polling: ${pollingActionName}`,
              result.error
            )
          );
      } else {
        if (result.value) {
          return resolve(result.value);
        }
      }
      const timerId = await setInterval(async () => {
        const result = await timerFunc(...args);
        if (result.isErr()) {
          clearInterval(timerId);
          return reject(
              new TimeoutError(
                `Fail on polling: ${pollingActionName}`,
                result.error
              )
            );
        } else {
          if (result.value) {
            clearInterval(timerId);
            return resolve(result.value);
          }
        }

        if (new Date().getTime() > timeoutTime) {
          //console.log('Timeout');
          clearInterval(timerId);
        } else {
          if (result.value) {
            clearInterval(timerId);
            return resolve(result.value);
          }
        }

        if (new Date().getTime() > timeoutTime) {
          //console.log('Timeout');
          clearInterval(timerId);
          return resolve(false);
        }
      }, intervalSeconds * 1000);
    } catch (e) {
      reject(e);
    }
  }));
}
