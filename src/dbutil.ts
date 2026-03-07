import { Prisma } from './generated/prisma/client.js';
import { GyomuResultAsync, runAsyncCustom } from './result';
import { DBError, CriticalError } from './errors';

export function genericDBFunction<T>(
  actionName: string,
  dbFunc: (...args: any[]) => Promise<T>,
  args: any[],
): GyomuResultAsync<T> {
  return runAsyncCustom(
    () => dbFunc(...args),
    (e) => {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError ||
        e instanceof Prisma.PrismaClientUnknownRequestError ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        return new DBError(`Fail: ${actionName}`, e);
      } else if (e instanceof CriticalError) {
        return e;
      } else if (e instanceof Prisma.PrismaClientRustPanicError) {
        return new CriticalError(
          'Critical error on Prisma. Need to terminate the application',
          e,
        );
      } else if (e instanceof DBError) {
        return e;
      } else {
        return new DBError(`Unknown Failure: ${actionName}`, e);
      }
    },
  );
}

export const currentTimestamp = () => {
  return new Date().getTime();
};
