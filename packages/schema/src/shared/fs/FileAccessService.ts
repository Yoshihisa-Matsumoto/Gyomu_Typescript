import { Context } from 'effect'
import type { FullPath } from '../../types.js'
import type { Effect, FileSystem } from 'effect'

import type { AccessError } from '../../error/AccessError.js'
import type { IOError } from '../../error/IOError.js'
import type { TimeoutError } from '../../error/TimeoutError.js'

/**
 * Provides a service for managing file access and synchronization, including checking accessibility and managing exclusive locks.
 */
export class FileAccessService extends Context.Service<
  FileAccessService,
  {
    canAccess: (
      fileName: FullPath,
      readOnly?: boolean,
    ) => Effect.Effect<boolean, AccessError | IOError | TimeoutError, FileSystem.FileSystem>
    waitTillExclusiveAccess: (
      fileName: FullPath,
      timeoutSeconds: number,
    ) => Effect.Effect<boolean, TimeoutError, FileSystem.FileSystem>
  }
>()('FileAccessService') {}
