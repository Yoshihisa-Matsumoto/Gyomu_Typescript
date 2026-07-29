import { Effect } from 'effect'
import { readFromFile } from '../fs/fs-utils.js'
import { sha256 } from './sha256.js'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

/**
 * Computes the SHA-256 hash of a file at the specified path.
 *
 * @param path The file system path to the file to hash.
 *
 * @returns An effect that produces the SHA-256 hash as a string. Requires FileSystem.FileSystem and may fail with an IOError.
 */
export const hashFile = (path: string): Effect.Effect<string, IOError, FileSystem.FileSystem> => {
  return Effect.gen(function* () {
    const data = yield* readFromFile(path)
    return sha256(data)
  })
}
