import { Effect } from 'effect'

import { GyomuError, logger, wrapInfraError } from '@gyomu/schema'
import { createSnapshot } from './createSnapshot.js'
import { saveSnapshot } from './saveSnapshot.js'
import { ensureProjectWorkspace } from './ensureProjectWorkspace.js'

import { diffSnapshot } from './diffSnapshot.js'
import type { FullPath } from '@gyomu/schema'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import type { FileSearchService } from '@gyomu/schema/shared/fs'
import type { FileSystem } from 'effect'
import type { FileHashSnapshot } from './types/FileHashSnapshot.js'

/**
 * Input parameters for committing a project snapshot, specifying the repository root, project path, and the expected snapshot state.
 */
export interface CommitProjectSnapshotInput {
  /**
   * The root directory path of the repository.
   */
  readonly repoRoot: FullPath

  /**
   * The workspace-relative path of the project.
   */
  readonly projectPath: WorkspaceRelativePath

  /**
   * The expected file hash snapshot to validate against.
   */
  readonly expectedSnapshot: FileHashSnapshot
}

/**
 * Commits a project snapshot by verifying the current file state against an expected snapshot and saving it to the project workspace.
 *
 * @param input The configuration details for the snapshot commit operation.
 *
 * @returns An Effect that completes when the snapshot is successfully saved or fails with a GyomuError if concurrent modifications are detected or an infra error occurs.
 *
 * @requires @requires FileSearchService and FileSystem.
 */
export const commitProjectSnapshot = (
  input: CommitProjectSnapshotInput,
): Effect.Effect<void, GyomuError, FileSearchService | FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const projectWorkspace = yield* ensureProjectWorkspace(input.repoRoot, input.projectPath)

    const snapshot = yield* createSnapshot({
      projectPath: input.projectPath,
      repoRoot: input.repoRoot,
    })

    const diffResult = diffSnapshot(input.expectedSnapshot, snapshot)
    if (diffResult.length > 0) {
      logger.info(diffResult, 'Snapshot diff result. Someone modified unexpectedly')
      return yield* Effect.fail(
        new GyomuError({
          cause: {
            added: diffResult.filter((d) => d.type === 'added').length,
            updated: diffResult.filter((d) => d.type === 'updated').length,
            deleted: diffResult.filter((d) => d.type === 'deleted').length,
          },
          domain: 'tsdoc.snapshot.commit',
          message: 'Snapshot diff detected. Project was modified during execution.',
          operation: 'commitSnapshot',
          reason: 'concurrent_modification',
        }),
      )
    }

    yield* saveSnapshot(projectWorkspace.snapshotPath, snapshot)
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(GyomuError, e, () => ({
        message: 'fail to commit project snapshot',
        domain: 'tsdoc.snapshot.commit',
        operation: 'commitSnapshot',
        reason: 'unexpected' as const,
      })),
    ),
  )
