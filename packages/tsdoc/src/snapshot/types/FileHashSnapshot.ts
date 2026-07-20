import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import type { FileHashEntry } from '@gyomu/schema/snapshot'
import type { GyomuVersion } from './ProjectWorkspaceManifest.js'

/**
 * Snapshot of file hash entries.
 *
 * Represents the current state of source files
 * used for change detection.
 *
 * Phase1 only stores raw hashes.
 */
export interface FileHashSnapshot {
  /**
   * Snapshot schema version.
   *
   * Used for snapshot format migration
   * and backward compatibility handling.
   */
  readonly version: GyomuVersion

  /**
   * Project root path
   * relative from workspace root.
   */
  readonly projectRoot: WorkspaceRelativePath

  /**
   * Collected file hash entries.
   */
  readonly files: ReadonlyArray<FileHashEntry>
}
