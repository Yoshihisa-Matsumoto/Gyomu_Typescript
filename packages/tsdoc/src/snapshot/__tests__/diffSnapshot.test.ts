import { describe, expect, it } from 'vitest'
import { diffSnapshot } from '../diffSnapshot.js'
import { GYOMU_VERSION } from '../types/ProjectWorkspaceManifest.js'

describe('diffSnapshot test', () => {
  it('detects added files', () => {
    const previous = { version: GYOMU_VERSION, files: [] }

    const current = {
      version: GYOMU_VERSION,
      files: [{ path: 'a.ts', rawHash: '1', updatedAt: '' }],
    }

    expect(diffSnapshot(previous, current)).toEqual([
      {
        type: 'added',
        path: 'a.ts',
        current: current.files[0],
      },
    ])
  })
  it('detects deleted files', () => {
    const previous = {
      version: GYOMU_VERSION,
      files: [{ path: 'a.ts', rawHash: '1', updatedAt: '' }],
    }

    const current = { version: GYOMU_VERSION, files: [] }

    expect(diffSnapshot(previous, current)).toEqual([
      {
        type: 'deleted',
        path: 'a.ts',
        previous: previous.files[0],
      },
    ])
  })
  it('detects updated files', () => {
    const previous = {
      version: GYOMU_VERSION,
      files: [{ path: 'a.ts', rawHash: '1', updatedAt: '' }],
    }

    const current = {
      version: GYOMU_VERSION,
      files: [{ path: 'a.ts', rawHash: '2', updatedAt: '' }],
    }

    expect(diffSnapshot(previous, current)).toEqual([
      {
        type: 'updated',
        path: 'a.ts',
        previous: previous.files[0],
        current: current.files[0],
      },
    ])
  })
  it('does not return unchanged files', () => {
    const snapshot = {
      version: GYOMU_VERSION,
      files: [{ path: 'a.ts', rawHash: '1', updatedAt: '' }],
    }

    expect(diffSnapshot(snapshot, snapshot)).toEqual([])
  })
})
