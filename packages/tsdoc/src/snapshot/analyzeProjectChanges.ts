import { Effect } from 'effect'

import { GyomuError, wrapInfraError } from '@gyomu/schema'
import { diffSnapshot } from './diffSnapshot.js'
import { loadSnapshot } from './loadSnapshot.js'
import { createSnapshot } from './createSnapshot.js'
import { ensureProjectWorkspace } from './ensureProjectWorkspace.js'
import { GYOMU_VERSION } from './types/ProjectWorkspaceManifest.js'
import type { FileHashSnapshot } from './types/FileHashSnapshot.js'
import type { FileSearchService } from '@gyomu/schema/shared/fs'
import type { FileSystem } from 'effect'
import type { FileHashEntry } from '@gyomu/schema/snapshot'

export interface AnalyzeProjectChangesInput {
  readonly repoRoot: string
  readonly projectPath: string
}

export interface AnalyzeProjectChangesResult {
  readonly projectId: string
  readonly snapshotPath: string
  readonly previousSnapshot: FileHashSnapshot | null
  readonly currentSnapshot: FileHashSnapshot
  readonly diff: ReturnType<typeof diffSnapshot>
}

export const analyzeProjectChanges = (
  input: AnalyzeProjectChangesInput,
): Effect.Effect<
  AnalyzeProjectChangesResult,
  GyomuError,
  FileSearchService | FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const projectWorkspace = yield* ensureProjectWorkspace(input.repoRoot, input.projectPath)

    // const projectAbsolutePath = toProjectAbsolutePath(input.projectPath, input.repoRoot)

    const previousSnapshot = yield* loadSnapshot(projectWorkspace.snapshotPath)

    const currentSnapshot = yield* createSnapshot(input)

    const diff = previousSnapshot
      ? diffSnapshot(previousSnapshot, currentSnapshot)
      : diffSnapshot(
          {
            version: GYOMU_VERSION,
            projectRoot: input.projectPath,
            files: [] as ReadonlyArray<FileHashEntry>,
          },
          currentSnapshot,
        )

    return yield* Effect.succeed({
      projectId: projectWorkspace.projectId,
      snapshotPath: projectWorkspace.snapshotPath,
      previousSnapshot,
      currentSnapshot,
      diff,
    })
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(GyomuError, e, () => {
        console.log(e)
        return {
          message: 'fail to analyze project snapshot',
          domain: 'tsdoc.snapshot.analyze',
          operation: 'analyzeSnapshot',
          reason: 'unexpected' as const,
        }
      }),
    ),
  )
