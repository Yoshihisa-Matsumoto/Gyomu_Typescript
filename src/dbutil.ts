import { Prisma } from './generated/prisma/client';
import { CriticalError, DBError } from './errors';
//import { Failure, PromiseResult } from './result';
import {ResultAsync} from './result';

export function genericDBFunction<T>(
  actionName: string,
  dbFunc: (...args: any[]) => Promise<T>,
  args: any[]
): ResultAsync<T, DBError> {

  return ResultAsync.fromPromise(
    dbFunc(...args),
    (e) => {
      // Prisma 系
      if (
        e instanceof Prisma.PrismaClientKnownRequestError ||
        e instanceof Prisma.PrismaClientUnknownRequestError ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        return new DBError(`Fail: ${actionName}`, e as Error);
      }

      // 致命的エラー → 再 throw（ResultAsync にしない）
      if (e instanceof Prisma.PrismaClientRustPanicError) {
        throw new CriticalError(
          'Critical error on Prisma. Need to terminate the application',
          e as Error
        );
      }

      if (e instanceof CriticalError) {
        throw e;
      }

      // その他
      return new DBError(`Unknown Failure: ${actionName}`, e as Error);
    }
  );
}