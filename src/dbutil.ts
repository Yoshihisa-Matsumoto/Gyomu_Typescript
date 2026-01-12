import { Prisma } from './generated/prisma/client';
import { CriticalError, DBError } from './errors';
import { Failure, PromiseResult } from './result';

export async function genericDBFunction<T>(
  actionName: string,
  dbFunc: (...args: any) => PromiseResult<T, DBError>,
  args: any[]
): PromiseResult<T, DBError> {
  return new Promise(async (resolve, reject) => {
    try {
      //console.log('calling');
      const result = await dbFunc(...args);
      //console.log('called');
      resolve(result);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError ||
        e instanceof Prisma.PrismaClientUnknownRequestError ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        resolve(new Failure(new DBError(`Fail: ${actionName}`, e as Error)));
      } else if (e instanceof CriticalError) {
        reject(e);
      } else if (e instanceof Prisma.PrismaClientRustPanicError) {
        reject(
          new CriticalError(
            'Critical error on Prisma. Need to terminate the application',
            e as Error
          )
        );
      } else {
        resolve(
          new Failure(new DBError(`Unknown Failure: ${actionName}`, e as Error))
        );
      }
    }
  });
}
