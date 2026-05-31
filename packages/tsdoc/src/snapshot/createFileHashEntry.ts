import { hashFile } from '@gyomu/infra/hash'
import { Effect } from 'effect'
import type { FileInfo } from '@gyomu/schema/gyomu/file'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

import type { FileHashEntry } from './types/FileHashEntry.js'

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
 * @param fileInfo Source file information
 */
export const createFileHashEntry = (
  fileInfo: FileInfo,
): Effect.Effect<FileHashEntry, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const rawHash = yield* hashFile(fileInfo.fullPath)

    return {
      path: fileInfo.fullPath,
      rawHash,
      updatedAt: fileInfo.updateTime.toISOString(),
    }
  })
