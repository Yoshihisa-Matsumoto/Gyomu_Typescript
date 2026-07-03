import { Effect } from 'effect'
import { readDirectoryDetailed } from '@gyomu/infra/fs'
import type { IOError } from '@gyomu/schema'
import type { BuildDirectoryOption, BuildResult } from '../types.js'
import type { FileSystem } from 'effect'

export const buildDirectoryConceptFromPath = (
  targetDirectory: string,
  option?: BuildDirectoryOption,
): Effect.Effect<BuildResult, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const entries = yield* readDirectoryDetailed(targetDirectory)

    const folders = entries
      .filter((e) => e.isDirectory)
      .sort((a, b) => a.name.localeCompare(b.name))

    return {
      concept: {
        summary: '',
        responsibilities: [],
        concepts: [],
        relationships: [],
        designDecisions: [],
      },
      changed: true,
    }
  })
