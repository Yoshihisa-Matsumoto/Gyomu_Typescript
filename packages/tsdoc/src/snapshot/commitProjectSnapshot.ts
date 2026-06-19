import { Effect } from 'effect'

import { GyomuError, logger, wrapInfraError } from '@gyomu/schema'
import { createSnapshot } from './createSnapshot.js'
import { saveSnapshot } from './saveSnapshot.js'
import { ensureProjectWorkspace } from './ensureProjectWorkspace.js'

import { diffSnapshot } from './diffSnapshot.js'
import type { FileSearchService } from '@gyomu/schema/shared/fs'
import type { FileSystem } from 'effect'
import type { FileHashSnapshot } from './types/FileHashSnapshot.js'

export interface CommitProjectSnapshotInput {
  readonly repoRoot: string
  readonly projectPath: string
  readonly expectedSnapshot: FileHashSnapshot
}

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
