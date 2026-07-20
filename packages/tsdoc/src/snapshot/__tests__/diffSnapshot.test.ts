import { describe, expect, it } from 'vitest'
import { ProjectRelativePath, WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { diffSnapshot } from '../diffSnapshot.js'
import { GYOMU_VERSION } from '../types/ProjectWorkspaceManifest.js'
import type { FileHashSnapshot } from '../types/FileHashSnapshot.js'

describe('diffSnapshot test', () => {
  it('detects added files', () => {
    const previous = { version: GYOMU_VERSION, projectRoot: WorkspaceRelativePath(''), files: [] }

    const current = {
      version: GYOMU_VERSION,
      projectRoot: WorkspaceRelativePath(''),
      files: [{ projectRelativePath: ProjectRelativePath('a.ts'), rawHash: '1', updatedAt: '' }],
    } satisfies FileHashSnapshot

    expect(diffSnapshot(previous, current)).toEqual([
      {
        type: 'added',
        projectRelativePath: 'a.ts',
        current: current.files[0],
      },
    ])
  })
  it('detects deleted files', () => {
    const previous = {
      version: GYOMU_VERSION,
      projectRoot: WorkspaceRelativePath(''),
      files: [{ projectRelativePath: ProjectRelativePath('a.ts'), rawHash: '1', updatedAt: '' }],
    }

    const current = { version: GYOMU_VERSION, projectRoot: WorkspaceRelativePath(''), files: [] }

    expect(diffSnapshot(previous, current)).toEqual([
      {
        type: 'deleted',
        projectRelativePath: 'a.ts',
        previous: previous.files[0],
      },
    ])
  })
  it('detects updated files', () => {
    const previous = {
      version: GYOMU_VERSION,
      projectRoot: WorkspaceRelativePath(''),
      files: [{ projectRelativePath: ProjectRelativePath('a.ts'), rawHash: '1', updatedAt: '' }],
    }

    const current = {
      version: GYOMU_VERSION,
      projectRoot: WorkspaceRelativePath(''),
      files: [{ projectRelativePath: ProjectRelativePath('a.ts'), rawHash: '2', updatedAt: '' }],
    }

    expect(diffSnapshot(previous, current)).toEqual([
      {
        type: 'updated',
        projectRelativePath: 'a.ts',
        previous: previous.files[0],
        current: current.files[0],
      },
    ])
  })
  it('does not return unchanged files', () => {
    const snapshot = {
      version: GYOMU_VERSION,
      projectRoot: WorkspaceRelativePath(''),
      files: [{ projectRelativePath: ProjectRelativePath('a.ts'), rawHash: '1', updatedAt: '' }],
    }

    expect(diffSnapshot(snapshot, snapshot)).toEqual([])
  })
})
