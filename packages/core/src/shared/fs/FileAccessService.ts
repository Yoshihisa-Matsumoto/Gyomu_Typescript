import { Effect, FileSystem, Layer, Context, Option } from 'effect';
import { AccessError, IOError, TimeoutError } from '../../errors.js';

export class FileAccessService extends Context.Service<
  FileAccessService,
  {
    canAccess: (
      fileName: string,
      readOnly?: boolean,
    ) => Effect.Effect<
      boolean,
      AccessError | IOError | TimeoutError,
      FileSystem.FileSystem
    >;
    waitTillExclusiveAccess: (
      fileName: string,
      timeoutSeconds: number,
    ) => Effect.Effect<boolean, TimeoutError, FileSystem.FileSystem>;
  }
>()('FileAccessService') {}
