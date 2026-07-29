import { Effect } from 'effect'

import { GyomuError, wrapInfraError } from '@gyomu/schema'
import { diffSnapshot } from './diffSnapshot.js'
import { loadSnapshot } from './loadSnapshot.js'
import { createSnapshot } from './createSnapshot.js'
import { ensureProjectWorkspace } from './ensureProjectWorkspace.js'
import { GYOMU_VERSION } from './types/ProjectWorkspaceManifest.js'
import type { FullPath } from '@gyomu/schema'
import type { FileHashSnapshot } from './types/FileHashSnapshot.js'
import type { FileSearchService } from '@gyomu/schema/shared/fs'
import type { FileSystem } from 'effect'
import type { FileHashEntry } from '@gyomu/schema/snapshot'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'

/**
 * Defines the input parameters required for analyzing project snapshot changes, including the repository root and the workspace relative path.
 */
export interface AnalyzeProjectChangesInput {
  /**
   * The absolute file system path to the root of the repository.
   */
  readonly repoRoot: FullPath

  /**
   * The path to the project relative to the workspace root.
   */
  readonly projectPath: WorkspaceRelativePath
}

/**
 * Represents the result of a project snapshot analysis, containing the project identifier, snapshot paths, snapshots for comparison, and the detected differences.
 */
export interface AnalyzeProjectChangesResult {
  /**
   * The unique identifier for the project.
   */
  readonly projectId: string

  /**
   * The file system path where the snapshot is stored.
   */
  readonly snapshotPath: string

  /**
   * The previous file hash snapshot, or null if no snapshot exists.
   */
  readonly previousSnapshot: FileHashSnapshot | null

  /**
   * The current file hash snapshot created during the analysis.
   */
  readonly currentSnapshot: FileHashSnapshot

  /**
   * The calculated difference between the previous and current snapshots.
   */
  readonly diff: ReturnType<typeof diffSnapshot>
}

/**
 * Analyzes project changes by comparing the current file snapshot against a previously stored one.
 *
 * @param input The input configuration containing the repository root and project path.
 *
 * @returns An Effect that resolves to an AnalyzeProjectChangesResult on success, or a GyomuError if the analysis fails. Requires FileSearchService and FileSystem capabilities.
 */
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
        // console.log(e)
        return {
          message: 'fail to analyze project snapshot',
          domain: 'tsdoc.snapshot.analyze',
          operation: 'analyzeSnapshot',
          reason: 'unexpected' as const,
        }
      }),
    ),
  )
