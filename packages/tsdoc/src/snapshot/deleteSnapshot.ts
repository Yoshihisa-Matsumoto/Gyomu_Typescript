import { removePath } from '@gyomu/infra/fs'
import { Effect } from 'effect'
import { ensureProjectWorkspace } from './ensureProjectWorkspace.js'
import type { FullPath } from '@gyomu/schema'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'

/**
 * Defines the input parameters for deleting a project snapshot, specifying the repository root and the workspace-relative path.
 */
export interface DeleteProjectSnapshotInput {
  /**
   * The absolute file system path to the repository root.
   */
  readonly repoRoot: FullPath

  /**
   * The path to the project relative to the workspace.
   */
  readonly projectPath: WorkspaceRelativePath
}

/**
 * Deletes the snapshot associated with the specified project workspace.
 *
 * @param input The configuration defining the repository root and project path for the snapshot to be removed.
 *
 * @returns An Effect representing the deletion operation.
 */
export const deleteSnapshot = (input: DeleteProjectSnapshotInput) =>
  Effect.gen(function* () {
    const projectWorkspace = yield* ensureProjectWorkspace(input.repoRoot, input.projectPath)
    console.log(projectWorkspace.snapshotPath)
    yield* removePath(projectWorkspace.snapshotPath, { recursive: true })
  })
