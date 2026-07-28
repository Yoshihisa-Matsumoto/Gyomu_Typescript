import { Effect } from 'effect'
import { FileSearchService } from '@gyomu/schema/shared/fs'
import type { FileSystem } from 'effect'
import type { FullPath, IOError } from '@gyomu/schema'
import type { FileInfo } from '@gyomu/schema/gyomu/file'

const TARGET_PATTERNS = ['**/*.ts', '**/*.tsx']

const EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.next/**']

/**
 * Enumerates source files used for TSDoc generation.
 *
 * Included:
 *
 * - .ts
 * - .tsx
 *
 * Excluded:
 *
 * - node_modules
 * - dist
 * - coverage
 * - .next
 *
 * Results are sorted by full path
 * to ensure deterministic snapshots.
 *
 * @param rootDirectory Root directory to search
 *
 * @returns An Effect containing a sorted array of identified source file information. Requires FileSearchService and FileSystem dependencies. May fail with an IOError.
 *
 * @@requires FileSearchService, FileSystem
 */
export const enumerateTargetFiles = (
  rootDirectory: FullPath,
): Effect.Effect<ReadonlyArray<FileInfo>, IOError, FileSearchService | FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fileSearch = yield* FileSearchService

    const files = yield* fileSearch.search({
      parentDirectory: rootDirectory,

      includes: TARGET_PATTERNS,

      excludes: EXCLUDE_PATTERNS,

      recursive: true,
    })

    const projectFiles = yield* fileSearch.search({
      parentDirectory: rootDirectory,
      includes: ['package.json', 'tsconfig.json'],
    })
    const conceptFiles = yield* fileSearch.search({
      parentDirectory: rootDirectory,
      includes: ['.gyomu/knowledge/*'],
    })
    files.push(...projectFiles)
    files.push(...conceptFiles)
    return files.sort((a, b) => a.fullPath.localeCompare(b.fullPath))
  })
