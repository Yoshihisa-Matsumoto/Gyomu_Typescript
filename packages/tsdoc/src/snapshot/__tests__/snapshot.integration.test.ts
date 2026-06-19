import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'
import { PlatformLayer } from '@gyomu/infra'
import { loadSnapshot } from '../loadSnapshot.js'
import { saveSnapshot } from '../saveSnapshot.js'
import { GYOMU_VERSION } from '../types/ProjectWorkspaceManifest.js'
import type { FileHashSnapshot } from '../types/FileHashSnapshot.js'

describe('Snapshot Integration', () => {
  it('loads saved snapshot', async () => {
    const snapshot: FileHashSnapshot = {
      version: GYOMU_VERSION,
      projectRoot: '',
      files: [
        {
          path: '/a.ts',
          rawHash: 'hash',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    }
    const filePath = join(tmpdir(), `tmp-${crypto.randomUUID()}.txt`)
    await Effect.runPromise(saveSnapshot(filePath, snapshot).pipe(Effect.provide(PlatformLayer)))

    const loaded = await Effect.runPromise(
      loadSnapshot(filePath).pipe(Effect.provide(PlatformLayer)),
    )

    expect(loaded).toEqual(snapshot)
  })
})
