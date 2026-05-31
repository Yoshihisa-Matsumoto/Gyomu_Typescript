import { Effect } from 'effect'
import { readStringFromFile } from '@gyomu/infra/fs'
import type { IOError } from '@gyomu/schema'
import type { FileSystem } from 'effect'

import type { FileHashSnapshot } from './types/FileHashSnapshot.js'

/**
 * Loads a file hash snapshot from JSON.
 *
 * @param path Snapshot file path
 */
export const loadSnapshot = (
  path: string,
): Effect.Effect<FileHashSnapshot | null, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const json = yield* readStringFromFile(path).pipe(
      Effect.catchTag('IOError', (e) => {
        if (e.reason == 'NotFound') {
          return Effect.succeed(null)
        }
        console.log(e)
        return Effect.fail(e)
      }),
    )
    if (!json) return null

    return JSON.parse(json) as FileHashSnapshot
  })
