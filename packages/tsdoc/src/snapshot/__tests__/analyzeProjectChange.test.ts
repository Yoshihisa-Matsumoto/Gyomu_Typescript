/* eslint-disable import/first */
import { describe, expect, it, vi } from 'vitest'
import { Effect, FileSystem } from 'effect'

import { FileSearchService } from '@gyomu/schema/shared/fs'
import { FullPath } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { analyzeProjectChanges } from '../analyzeProjectChanges.js'

// ------------------------
// mocks
// ------------------------

vi.mock('../ensureProjectWorkspace', () => ({
  ensureProjectWorkspace: vi.fn(),
}))

vi.mock('../loadSnapshot', () => ({
  loadSnapshot: vi.fn(),
}))

vi.mock('../createSnapshot', () => ({
  createSnapshot: vi.fn(),
}))

vi.mock('../diffSnapshot', () => ({
  diffSnapshot: vi.fn(),
}))

import { ensureProjectWorkspace } from '../ensureProjectWorkspace.js'
import { loadSnapshot } from '../loadSnapshot.js'
import { createSnapshot } from '../createSnapshot.js'
import { diffSnapshot } from '../diffSnapshot.js'
import { GYOMU_VERSION } from '../types/ProjectWorkspaceManifest.js'
import type { FileHashSnapshot } from '../types/FileHashSnapshot.js'

const run = <A, E>(eff: Effect.Effect<A, E, FileSystem.FileSystem | FileSearchService>) =>
  Effect.runSync(
    eff.pipe(
      Effect.provideService(FileSystem.FileSystem, {} as any),
      Effect.provideService(FileSearchService, {} as any),
    ),
  )

describe('analyzeProjectChanges', () => {
  const repoRoot = FullPath('/repo')
  const projectPath = WorkspaceRelativePath('packages/app')

  const workspace = {
    projectId: 'abc123',
    snapshotPath: '/repo/.gyomu/abc123/cache/tsdoc/v1/file-hashes.json',
  }

  const currentSnapshot: FileHashSnapshot = {
    version: GYOMU_VERSION,
    projectRoot: WorkspaceRelativePath(''),
    files: [{ path: 'a.ts', rawHash: '1' } as any],
  }

  it('analyzes with previous snapshot', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(loadSnapshot).mockReturnValue(
      Effect.succeed({
        files: [{ path: 'a.ts', rawHash: 'old' } as any],
      } as any),
    )

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([{ type: 'updated', path: 'a.ts' } as any])

    const result = run(analyzeProjectChanges({ repoRoot, projectPath }))

    expect(result.projectId).toBe('abc123')
    expect(result.snapshotPath).toContain('file-hashes.json')

    expect(result.previousSnapshot).toBeDefined()
    expect(result.currentSnapshot).toEqual(currentSnapshot)

    expect(result.diff.length).toBe(1)

    expect(diffSnapshot).toHaveBeenCalled()
  })

  it('handles missing previous snapshot (cold start)', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(loadSnapshot).mockReturnValue(Effect.succeed(null))

    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([])

    const result = run(analyzeProjectChanges({ repoRoot, projectPath }))

    expect(result.previousSnapshot).toBe(null)

    expect(diffSnapshot).toHaveBeenCalledWith(
      { version: GYOMU_VERSION, projectRoot: 'packages/app', files: [] },
      currentSnapshot,
    )
  })

  it('calls createSnapshot with projectPath', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(loadSnapshot).mockReturnValue(Effect.succeed(null as any))
    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([])

    run(analyzeProjectChanges({ repoRoot, projectPath }))

    expect(createSnapshot).toHaveBeenCalledWith({ projectPath, repoRoot })
  })

  it('propagates workspace data correctly', () => {
    vi.mocked(ensureProjectWorkspace).mockReturnValue(Effect.succeed(workspace as any))

    vi.mocked(loadSnapshot).mockReturnValue(Effect.succeed(null as any))
    vi.mocked(createSnapshot).mockReturnValue(Effect.succeed(currentSnapshot))

    vi.mocked(diffSnapshot).mockReturnValue([])

    const result = run(analyzeProjectChanges({ repoRoot, projectPath }))

    expect(result.snapshotPath).toBe(workspace.snapshotPath)
    expect(result.projectId).toBe(workspace.projectId)
  })
})
