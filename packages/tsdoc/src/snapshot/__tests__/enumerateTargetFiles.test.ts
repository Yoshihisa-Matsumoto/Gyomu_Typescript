import { Effect, FileSystem } from 'effect'
import { describe, expect, it, vi } from 'vitest'
import { FileSearchService } from '@gyomu/schema/shared/fs'
import { FullPath } from '@gyomu/schema'
import { enumerateTargetFiles } from '../enumerateTargetFiles.js'

describe('enumerateTargetFiles', () => {
  it('passes correct search conditions', async () => {
    const search = vi.fn().mockReturnValue(Effect.succeed([]))

    await Effect.runPromise(
      enumerateTargetFiles(FullPath('/project')).pipe(
        Effect.provideService(FileSystem.FileSystem, {} as any),
        Effect.provideService(FileSearchService, {
          search,
        }),
      ),
    )

    expect(search).toHaveBeenCalledWith({
      parentDirectory: '/project',

      includes: ['**/*.ts', '**/*.tsx'],

      excludes: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.next/**'],

      recursive: true,
    })
  })

  it('returns sorted files', async () => {
    const search = vi.fn().mockReturnValue(
      Effect.succeed([
        {
          fullPath: '/b.ts',
        },
        {
          fullPath: '/a.ts',
        },
      ]),
    )

    const result = await Effect.runPromise(
      enumerateTargetFiles(FullPath('/project')).pipe(
        Effect.provideService(FileSystem.FileSystem, {} as any),
        Effect.provideService(FileSearchService, {
          search,
        }),
      ),
    )

    expect(result.map((x) => x.fullPath)).toEqual(['/a.ts', '/b.ts'])
  })
})
