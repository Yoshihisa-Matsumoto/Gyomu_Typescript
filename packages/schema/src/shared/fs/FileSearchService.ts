import { Context } from 'effect'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '../../error/IOError.js'
import type { FileFilterInfo } from '../../gyomu/file/filter.js'
import type { FileInfo } from '../../gyomu/file/types.js'

export class FileSearchService extends Context.Service<
  FileSearchService,
  {
    search: (
      parentDirectory: string,
      filterConditions: Array<FileFilterInfo>,
      isRecursive?: boolean,
    ) => Effect.Effect<Array<FileInfo>, IOError, FileSystem.FileSystem>
  }
>()('FileSearchService') {}
