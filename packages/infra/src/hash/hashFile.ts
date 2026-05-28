import { Effect } from 'effect'
import { readFromFile } from '../fs/fs-utils.js'
import { sha256 } from './sha256.js'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

export const hashFile = (path: string): Effect.Effect<string, IOError, FileSystem.FileSystem> => {
  return Effect.gen(function* () {
    const data = yield* readFromFile(path)
    return sha256(data)
  })
}
