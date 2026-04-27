import { Effect, FileSystem, Layer, ServiceMap, Option } from 'effect';
import { AccessError, IOError, TimeoutError } from '../../errors.js';
import { platform } from '../../infrastructure/fs/index.js';
import { ensure, ensureEffect, fromPromise } from '../effect/core.js';

import { polling } from '../effect/timer.js';
import { getFileStat, pathExists } from '../../infrastructure/fs/fs-utils.js';

const canAccessFunc = (
  fileName: string,
  readOnly?: boolean,
): Effect.Effect<boolean, AccessError | IOError, FileSystem.FileSystem> => {
  return Effect.gen(function* () {
    yield* ensureEffect(
      pathExists(fileName),
      AccessError,
      `File Not exist: ${fileName}`,
    );

    const specialExtension = ['xls', 'xlsm', 'xlsx', 'zip'];
    const stat = yield* getFileStat(fileName);

    yield* ensure(
      !(
        specialExtension.includes(platform.extname(fileName)) &&
        stat.size === FileSystem.Size(0)
      ),
      AccessError,
      `File is invalid: ${fileName}`,
    );

    if (readOnly) return true;

    yield* fromPromise(
      IOError,
      `Sleep Fail`,
    )(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const stat2 = yield* getFileStat(fileName);

    const getTime = (opt: Option.Option<Date>) =>
      Option.getOrElse(opt, () => new Date(0));

    const isChanged =
      stat.size !== stat2.size ||
      getTime(stat.birthtime).getTime() !==
        getTime(stat2.birthtime).getTime() ||
      getTime(stat.mtime).getTime() !== getTime(stat2.mtime).getTime();

    yield* ensure(
      !isChanged,
      AccessError,
      `File is under operation: ${fileName}`,
    );

    return true;
  });
};
export class FileAccessService extends ServiceMap.Service<
  FileAccessService,
  {
    canAccess: (
      fileName: string,
      readOnly?: boolean,
    ) => Effect.Effect<boolean, AccessError | IOError, FileSystem.FileSystem>;
    waitTillExclusiveAccess: (
      fileName: string,
      timeoutSeconds: number,
    ) => Effect.Effect<boolean, TimeoutError, FileSystem.FileSystem>;
  }
>()('FileAccessService', {
  make: Effect.succeed({
    canAccess: canAccessFunc,
    waitTillExclusiveAccess: (fileName, timeoutSeconds) => {
      return polling(
        `File Access check ${fileName}`,
        timeoutSeconds,
        0.5,
        (): Effect.Effect<boolean, AccessError, FileSystem.FileSystem> =>
          canAccessFunc(fileName, false).pipe(
            Effect.catch((e) => {
              //console.log(e);
              return Effect.succeed(false);
            }),
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
