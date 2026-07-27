import { Effect } from 'effect'

import { writeStringToFile } from '@gyomu/infra/fs'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

import type { FileHashSnapshot } from './types/FileHashSnapshot.js'

/**
 * Saves a file hash snapshot as JSON.
 *
 * The snapshot is formatted with indentation
 * to keep it human-readable and diff-friendly.
 *
 * @param path Output snapshot file path
 *
 * @param snapshot Snapshot to save
 *
 * @returns An effect that writes the snapshot to the specified path. Requires FileSystem service and may fail with an IOError.
 */
export const saveSnapshot = (
  path: string,
  snapshot: FileHashSnapshot,
): Effect.Effect<void, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const json = JSON.stringify(snapshot, null, 2)

    yield* writeStringToFile(path, json)
  })
