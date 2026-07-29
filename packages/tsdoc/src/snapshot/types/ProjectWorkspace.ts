/**
 * Represents the workspace configuration for a project, including paths to its manifest and snapshot files.
 */
export interface ProjectWorkspace {
  /**
   * The unique identifier of the project.
   */
  readonly projectId: string

  /**
   * The absolute file system path to the project root directory.
   */
  readonly projectRoot: string

  /**
   * The file system path to the project manifest file.
   */
  readonly manifestPath: string

  /**
   * The file system path to the project snapshot file.
   */
  readonly snapshotPath: string
}
