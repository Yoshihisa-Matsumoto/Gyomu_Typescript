import type { ProjectRelativePath } from '../typescript/types.js'
import type { FileHashEntry } from './FileHashEntry.js'

/**
 * Defines the category of change applied to a file, which can be added, updated, or deleted.
 */
export type FileChangeType = 'added' | 'updated' | 'deleted'

/**
 * Represents a modification to a file, including its type, path, and optional state before and after the change.
 */
export interface FileChange {
  /**
   * The type of change that occurred.
   */
  readonly type: FileChangeType

  /**
   * The project-relative path of the affected file.
   */
  readonly projectRelativePath: ProjectRelativePath

  /**
   * The optional state of the file before the change.
   */
  readonly previous?: FileHashEntry

  /**
   * The optional state of the file after the change.
   */
  readonly current?: FileHashEntry
}
