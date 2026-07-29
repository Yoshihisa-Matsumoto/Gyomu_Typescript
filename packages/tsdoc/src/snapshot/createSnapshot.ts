import { Effect } from 'effect'

import { toAbsolutePath } from '@gyomu/ts-analysis'
import { createFileHashEntry } from './createFileHashEntry.js'
import { enumerateTargetFiles } from './enumerateTargetFiles.js'
import { GYOMU_VERSION } from './types/ProjectWorkspaceManifest.js'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import type { FileSystem } from 'effect'
import type { FullPath, IOError } from '@gyomu/schema'

import type { FileHashSnapshot } from './types/FileHashSnapshot.js'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Creates a snapshot of project source files.
 *
 * This process:
 *
 * 1. Enumerates target files
 * 2. Generates raw hashes
 * 3. Builds snapshot entries
 *
 * Phase1 does not generate semantic hashes.
 *
 * @param args Configuration containing the repository root and workspace-relative project path.
 *
 * @returns An Effect representing the file hash snapshot, which may fail with an IOError and requires FileSearchService and FileSystem services.
 */
export const createSnapshot = (args: {
  repoRoot: FullPath
  projectPath: WorkspaceRelativePath
}): Effect.Effect<FileHashSnapshot, IOError, FileSearchService | FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const projectAbsolutePath = toAbsolutePath(args.projectPath, args.repoRoot)
    const files = yield* enumerateTargetFiles(projectAbsolutePath)
    const createFileHashEntryForProject = createFileHashEntry(args)
    const entries = yield* Effect.forEach(files, createFileHashEntryForProject, {
      concurrency: 'unbounded',
    })

    return {
      version: GYOMU_VERSION,
      projectRoot: args.projectPath,
      files: entries,
    }
  })
