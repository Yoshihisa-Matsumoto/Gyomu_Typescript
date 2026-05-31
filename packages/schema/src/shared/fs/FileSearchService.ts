import { Context } from 'effect'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '../../error/IOError.js'
import type { FileFilterInfo } from '../../gyomu/file/filter.js'
import type { FileInfo } from '../../gyomu/file/types.js'

export class FileSearchService extends Context.Service<
  FileSearchService,
  {
    search: (
      query: FileSearchQuery,
    ) => Effect.Effect<Array<FileInfo>, IOError, FileSystem.FileSystem>
  }
>()('FileSearchService') {}

export interface FileSearchQuery {
  readonly parentDirectory: string

  readonly includes?: ReadonlyArray<string>

  readonly excludes?: ReadonlyArray<string>

  readonly recursive?: boolean

  readonly metadataFilters?: ReadonlyArray<FileFilterInfo>
}
