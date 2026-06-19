import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'
import { FileSearchService } from '@gyomu/schema/shared/fs'
import { PlatformLayer } from '@gyomu/infra'
import { FileSearchServiceLayer } from '@gyomu/infra/fs'
import { createSnapshot } from '../createSnapshot.js'
import { GYOMU_VERSION } from '../types/ProjectWorkspaceManifest.js'

describe('createSnapshot', () => {
  it('creates snapshot from enumerated files', async () => {
    const search = vi.fn().mockReturnValue(
      Effect.succeed([
        {
          fullPath: '/project/a.ts',
          updateTime: new Date('2026-01-01T00:00:00.000Z'),
        },
        {
          fullPath: '/project/b.ts',
          updateTime: new Date('2026-01-02T00:00:00.000Z'),
        },
      ]),
    )

    const result = await Effect.runPromise(
      createSnapshot({ repoRoot: './test-fixtures/snapshot', projectPath: '' }).pipe(
        Effect.provide(FileSearchServiceLayer),
        Effect.provide(PlatformLayer),
      ),
    )

    expect(result.files).toHaveLength(3)
    console.log(result.files[0]?.path)
    expect(result.files[0]?.path).contains(join('test-fixtures', 'snapshot', 'sample-a.ts'))

    expect(result.files[1]?.path).contains(join('test-fixtures', 'snapshot', 'sample-b.ts'))
    expect(result.files[2]?.path).contains(join('test-fixtures', 'snapshot', 'sample.ts'))

    expect(result.files[0]?.rawHash).toBeTruthy()

    expect(result.files[1]?.rawHash).toBeTruthy()
    expect(result.files[2]?.rawHash).toBeTruthy()
  })

  it('returns empty snapshot when no files found', async () => {
    const search = vi.fn().mockReturnValue(Effect.succeed([]))

    const result = await Effect.runPromise(
      createSnapshot({ repoRoot: '/project', projectPath: '' }).pipe(
        Effect.provideService(FileSystem.FileSystem, {} as any),
        Effect.provideService(FileSearchService, {
          search,
        }),
      ),
    )

    expect(result).toEqual({
      version: GYOMU_VERSION,
      projectRoot: '',
      files: [],
    })
  })
})
