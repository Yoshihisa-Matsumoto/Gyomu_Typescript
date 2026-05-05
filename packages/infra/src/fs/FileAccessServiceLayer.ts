import { Effect, FileSystem, Layer, Option } from 'effect';
import { AccessError, IOError, TimeoutError } from '@gyomu/core';
import path from 'path';
import { ensure, ensureEffect, fromPromise } from '@gyomu/shared/effect';

import { polling } from '@gyomu/core/shared/effect';
import { getFileStat, pathExists } from '../fs/fs-utils.js';
import { FileAccessService } from '@gyomu/core/shared/fs';

const canAccessFunc = (
  fileName: string,
  readOnly?: boolean,
): Effect.Effect<
  boolean,
  AccessError | IOError | TimeoutError,
  FileSystem.FileSystem
> => {
  return Effect.gen(function* () {
    yield* ensureEffect(pathExists(fileName), AccessError, () => ({
      cause: undefined,
      message: 'File does not exist',
      reason: 'not_exist' as const,
      resource: fileName,
    }));

    const specialExtension = ['xls', 'xlsm', 'xlsx', 'zip'];
    const stat = yield* getFileStat(fileName);

    yield* ensure(
      !(
        specialExtension.includes(path.extname(fileName)) &&
        stat.size === FileSystem.Size(0)
      ),
      AccessError,
      () => ({
        message: 'File size must not be zero + not an Excel/Zip',
        reason: 'invalid' as const,
        resource: fileName,
      }),
    );

    if (readOnly) return true;

    yield* fromPromise(TimeoutError, () => ({
      message: 'setTimeout error',
      action: 'setTimeout',
      timeoutSeconds: 0.1,
    }))(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const stat2 = yield* getFileStat(fileName);

    const getTime = (opt: Option.Option<Date>) =>
      Option.getOrElse(opt, () => new Date(0));

    const isChanged =
      stat.size !== stat2.size ||
      getTime(stat.birthtime).getTime() !==
        getTime(stat2.birthtime).getTime() ||
      getTime(stat.mtime).getTime() !== getTime(stat2.mtime).getTime();

    yield* ensure(!isChanged, AccessError, () => ({
      message: `File is under operation`,
      reason: 'in_use' as const,
      resource: fileName,
    }));

    return true;
  });
};

export const FileAccessServiceLayer = Layer.effect(
  FileAccessService,
  Effect.succeed({
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
            new TimeoutError({
              message: `Timeout on waiting file access: ${fileName}`,
              action: 'Wait till exclusive access on file',
              timeoutSeconds,
              cause: error,
            }),
        ),
      );
    },
  }),
);
