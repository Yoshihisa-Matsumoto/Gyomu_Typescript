import { hashFile } from '@gyomu/infra/hash'
import { Effect } from 'effect'
import { toAbsolutePath, toProjectRelativePath } from '@gyomu/ts-analysis'
import { FullPath } from '@gyomu/schema'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import type { FileInfo } from '@gyomu/schema/gyomu/file'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

import type { FileHashEntry } from '@gyomu/schema/snapshot'

/**
 * Creates a hash entry from a source file.
 *
 * Phase1 only generates raw hashes based on:
 *
 * ```text
 * sha256(file content)
 * ```
 *
 * Semantic hashing is intentionally excluded
 * at this stage.
 *
 * @param args Configuration containing the repository root and project workspace path.
 *
 * @param fileInfo Source file information.
 *
 * @returns An Effect that yields a FileHashEntry, requiring FileSystem and potentially throwing an IOError.
 */
export const createFileHashEntry =
  (args: { repoRoot: FullPath; projectPath: WorkspaceRelativePath }) =>
  (fileInfo: FileInfo): Effect.Effect<FileHashEntry, IOError, FileSystem.FileSystem> =>
    Effect.gen(function* () {
      const rawHash = yield* hashFile(fileInfo.fullPath)
      const projectAbsolutePath = toAbsolutePath(args.projectPath, args.repoRoot)
      const sourceRelativePath = toProjectRelativePath(
        FullPath(fileInfo.fullPath),
        projectAbsolutePath,
      )
      return {
        projectRelativePath: sourceRelativePath,
        rawHash,
        updatedAt: fileInfo.updateTime.toISOString(),
      }
    })
