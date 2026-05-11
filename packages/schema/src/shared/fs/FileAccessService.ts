import { Context } from 'effect'
import type { Effect, FileSystem } from 'effect'

import type { AccessError } from '../../error/AccessError.js'
import type { IOError } from '../../error/IOError.js'
import type { TimeoutError } from '../../error/TimeoutError.js'

export class FileAccessService extends Context.Service<
  FileAccessService,
  {
    canAccess: (
      fileName: string,
      readOnly?: boolean,
    ) => Effect.Effect<boolean, AccessError | IOError | TimeoutError, FileSystem.FileSystem>
    waitTillExclusiveAccess: (
      fileName: string,
      timeoutSeconds: number,
    ) => Effect.Effect<boolean, TimeoutError, FileSystem.FileSystem>
  }
>()('FileAccessService') {}
