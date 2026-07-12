import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Exit, FileSystem } from 'effect'

import { FileSearchService } from '@gyomu/schema/shared/fs'
import { FullPath, getFailureFromExit } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { commitProjectSnapshot } from '../commitProjectSnapshot.js'

import { ensureProjectWorkspace } from '../ensureProjectWorkspace.js'
import { createSnapshot } from '../createSnapshot.js'
import { saveSnapshot } from '../saveSnapshot.js'
import { diffSnapshot } from '../diffSnapshot.js'
import { GYOMU_VERSION } from '../types/ProjectWorkspaceManifest.js'
import type { FileHashSnapshot } from '../types/FileHashSnapshot.js'

// ------------------------
// mocks
// ------------------------

vi.mock('../ensureProjectWorkspace', () => ({
  ensureProjectWorkspace: vi.fn(),
}))

vi.mock('../createSnapshot', () => ({
  createSnapshot: vi.fn(),
}))

vi.mock('../saveSnapshot', () => ({
  saveSnapshot: vi.fn(),
}))

vi.mock('../diffSnapshot', () => ({
  diffSnapshot: vi.fn(),
}))

const run = <A, E>(eff: Effect.Effect<A, E, FileSystem.FileSystem | FileSearchService>) =>
  Effect.runSyncExit(
    eff.pipe(
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(FileSearchService, {} as any),
    ),
  )

describe('commitProjectSnapshot', () => {
  const workspace = {
    projectId: 'abc123',
    snapshotPath: '/repo/.gyomu/abc123/cache/tsdoc/v1/file-hashes.json',
  }

  const expectedSnapshot: FileHashSnapshot = {
    version: GYOMU_VERSION,
    projectRoot: WorkspaceRelativePath(''),
    files: [{ path: 'a.ts', rawHash: 'old' } as any],
  }

  const currentSnapshot: FileHashSnapshot = {
    version: GYOMU_VERSION,
    projectRoot: WorkspaceRelativePath(''),
    files: [{ path: 'a.ts', rawHash: 'new' } as any],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves snapshot when no diff exists', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([])

    vi.mocked(saveSnapshot).mockReturnValue(Effect.void)

    const result = run(
      commitProjectSnapshot({
        repoRoot: FullPath(FullPath('/repo')),
        projectPath: WorkspaceRelativePath('packages/app'),
        expectedSnapshot,
      }),
    )

    expect(Exit.isSuccess(result)).toBe(true)

    expect(saveSnapshot).toHaveBeenCalledWith(workspace.snapshotPath, currentSnapshot)
  })

  it('fails when concurrent modification is detected', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([
      {
        type: 'updated',
        path: 'a.ts',
      } as any,
    ])

    const result = run(
      commitProjectSnapshot({
        repoRoot: FullPath('/repo'),
        projectPath: WorkspaceRelativePath('packages/app'),
        expectedSnapshot,
      }),
    )

    expect(Exit.isFailure(result)).toBe(true)

    if (Exit.isFailure(result)) {
      const err = getFailureFromExit(result)
      expect(err.reason).toContain('concurrent_modification')
    }

    expect(saveSnapshot).not.toHaveBeenCalled()
  })

  it('creates snapshot using projectPath', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([])

    vi.mocked(saveSnapshot).mockReturnValue(Effect.void)

    run(
      commitProjectSnapshot({
        repoRoot: FullPath('/repo'),
        projectPath: WorkspaceRelativePath('packages/app'),
        expectedSnapshot,
      }),
    )

    expect(createSnapshot).toHaveBeenCalledWith({
      projectPath: WorkspaceRelativePath('packages/app'),
      repoRoot: FullPath('/repo'),
    })
  })

  it('passes expected and current snapshots to diffSnapshot', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([])

    vi.mocked(saveSnapshot).mockReturnValue(Effect.void)

    run(
      commitProjectSnapshot({
        repoRoot: FullPath('/repo'),
        projectPath: WorkspaceRelativePath('packages/app'),
        expectedSnapshot,
      }),
    )

    expect(diffSnapshot).toHaveBeenCalledWith(expectedSnapshot, currentSnapshot)
  })

  it('does not save snapshot when diff exists', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([
      {
        type: 'deleted',
        path: 'a.ts',
      } as any,
    ])

    const result = run(
      commitProjectSnapshot({
        repoRoot: FullPath('/repo'),
        projectPath: WorkspaceRelativePath('packages/app'),
        expectedSnapshot,
      }),
    )

    expect(Exit.isFailure(result)).toBe(true)

    expect(saveSnapshot).not.toHaveBeenCalled()
  })

  it('propagates workspace snapshot path correctly', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([])

    vi.mocked(saveSnapshot).mockReturnValue(Effect.void)

    run(
      commitProjectSnapshot({
        repoRoot: FullPath('/repo'),
        projectPath: WorkspaceRelativePath('packages/app'),
        expectedSnapshot,
      }),
    )

    expect(saveSnapshot).toHaveBeenCalledWith(workspace.snapshotPath, currentSnapshot)
  })
})
