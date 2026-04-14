import { Effect, Layer, ServiceMap } from 'effect';
import { AccessError, TimeoutError } from '../../errors.js';
import { platform } from '../../platform/index.js';
import { fromPromise } from '../effect/core.js';
import { isEqual } from 'date-fns';
import { polling } from '../effect/timer.js';

const canAccessFunc = (
  fileName: string,
  readOnly?: boolean,
): Effect.Effect<boolean, AccessError> => {
  if (!platform.existsSync(fileName))
    return Effect.fail(new AccessError(`File Not exist: ${fileName}`));
  const specialExtension = ['xls', 'xlsm', 'xlsx', 'zip'];
  const stat = platform.statSync(fileName);

  if (specialExtension.includes(platform.extname(fileName)) && stat.size === 0)
    return Effect.fail(new AccessError(`File is invalid: ${fileName}`));
  if (readOnly) return Effect.succeed(true);

  return fromPromise(
    AccessError,
    `File check failed: ${fileName}`,
  )(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stat2 = platform.statSync(fileName);
    if (
      !isEqual(stat.ctime, stat2.ctime) ||
      !isEqual(stat.mtime, stat2.mtime)
    ) {
      throw new AccessError(`File is under operation: ${fileName}`);
    }

    return true;
  });
};
export class FileAccessService extends ServiceMap.Service<
  FileAccessService,
  {
    canAccess: (
      fileName: string,
      readOnly?: boolean,
    ) => Effect.Effect<boolean, AccessError>;
    waitTillExclusiveAccess: (
      fileName: string,
      timeoutSeconds: number,
    ) => Effect.Effect<boolean, TimeoutError>;
  }
>()('FileAccessService', {
  make: Effect.succeed({
    canAccess: canAccessFunc,
    waitTillExclusiveAccess: (fileName, timeoutSeconds) => {
      return polling(
        `File Access check ${fileName}`,
        timeoutSeconds,
        0.5,
        (): Effect.Effect<boolean, AccessError> =>
          canAccessFunc(fileName, false).pipe(
            Effect.catch(() => Effect.succeed(false)),
          ),
        fileName,
      ).pipe(
        Effect.mapError(
          (error) =>
            new TimeoutError(
              `Timeout on waiting file access: ${fileName}`,
              error,
            ),
        ),
      );
    },
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
