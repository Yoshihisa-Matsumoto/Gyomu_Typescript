import { resolve } from 'path';
import { BaseError, TimeoutError } from './errors';
import { Failure, PromiseResult, Result, success } from './result';

export async function polling<E extends BaseError>(
  pollingActionName: string,
  timeoutSeconds: number,
  intervalSeconds: number,
  timerFunc: (...args: any) => PromiseResult<boolean, E>,
  ...args: any
) {
  const timeoutTime = new Date().getTime() + timeoutSeconds * 1000;

  return new Promise<Result<boolean, TimeoutError>>(async (resolve, reject) => {
    try {
      const result = await timerFunc(...args);
      if (result.isFailure()) {
        return resolve(
          new Failure(
            new TimeoutError(
              `Fail on polling: ${pollingActionName}`,
              result.error
            )
          )
        );
      } else {
        if (result.value) {
          return resolve(success(result.value));
        }
      }
      const timerId = await setInterval(async () => {
        const result = await timerFunc(...args);
        if (result.isFailure()) {
          clearInterval(timerId);
          return resolve(
            new Failure(
              new TimeoutError(
                `Fail on polling: ${pollingActionName}`,
                result.error
              )
            )
          );
        } else {
          if (result.value) {
            clearInterval(timerId);
            return resolve(success(result.value));
          }
        }

        if (new Date().getTime() > timeoutTime) {
          //console.log('Timeout');
          clearInterval(timerId);
          return resolve(success(false));
        }
      }, intervalSeconds * 1000);
    } catch (e) {
      reject(e);
    }
  });
}
