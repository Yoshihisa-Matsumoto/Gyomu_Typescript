import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'

import { removePath } from '@gyomu/infra/fs'
import { FullPath, WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { deleteSnapshot } from '../deleteSnapshot.js'
import { ensureProjectWorkspace } from '../ensureProjectWorkspace.js'

vi.mock('@gyomu/infra/fs', () => ({
  removePath: vi.fn(),
}))

vi.mock('../ensureProjectWorkspace.js', () => ({
  ensureProjectWorkspace: vi.fn(),
}))

describe('deleteSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(ensureProjectWorkspace).mockReturnValue(
      Effect.succeed({
        snapshotPath: FullPath('/repo/.gyomu/snapshot'),
      } as any),
    )

    vi.mocked(removePath).mockReturnValue(Effect.void)
  })

  it('deletes snapshot directory', async () => {
    await Effect.runPromise(
      deleteSnapshot({
        repoRoot: FullPath('/repo'),
        projectPath: WorkspaceRelativePath('/repo/packages/app'),
      }).pipe(Effect.provideService(FileSystem.FileSystem, {} as any)),
    )

    expect(ensureProjectWorkspace).toHaveBeenCalledWith('/repo', '/repo/packages/app')

    expect(removePath).toHaveBeenCalledWith('/repo/.gyomu/snapshot', { recursive: true })
  })
})
