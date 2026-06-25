import { Context } from 'effect'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '../../error/IOError.js'
import type { FileFilterInfo } from '../../gyomu/file/filter.js'
import type { FileInfo } from '../../gyomu/file/types.js'

/**
 * A service for searching files within the filesystem based on specified criteria.
 */
export class FileSearchService extends Context.Service<
  FileSearchService,
  {
    search: (
      query: FileSearchQuery,
    ) => Effect.Effect<Array<FileInfo>, IOError, FileSystem.FileSystem>
  }
>()('FileSearchService') {}

/**
 * Defines the criteria for a file search, including the search directory, inclusion/exclusion patterns, recursion settings, and additional metadata filters.
 */
export interface FileSearchQuery {
  /**
   * The base directory path to perform the search within.
   */
  readonly parentDirectory: string

  /**
   * Optional list of file patterns or names to include in the search.
   */
  readonly includes?: ReadonlyArray<string>

  /**
   * Optional list of file patterns or names to exclude from the search results.
   */
  readonly excludes?: ReadonlyArray<string>

  /**
   * Whether to search subdirectories recursively.
   */
  readonly recursive?: boolean

  /**
   * Optional list of filters based on file metadata.
   */
  readonly metadataFilters?: ReadonlyArray<FileFilterInfo>
}
