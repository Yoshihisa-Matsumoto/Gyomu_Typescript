import { Effect } from 'effect'

import { toProjectAbsolutePath } from '../shared/index.js'
import { createFileHashEntry } from './createFileHashEntry.js'
import { enumerateTargetFiles } from './enumerateTargetFiles.js'
import { GYOMU_VERSION } from './types/ProjectWorkspaceManifest.js'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

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
 * @param rootDirectory Project root directory
 */
export const createSnapshot = (args: {
  repoRoot: string
  projectPath: string
}): Effect.Effect<FileHashSnapshot, IOError, FileSearchService | FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const projectAbsolutePath = toProjectAbsolutePath(args.projectPath, args.repoRoot)
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
