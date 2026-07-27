import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { FileHashSnapshot } from './types/FileHashSnapshot.js'
import type { FileChange } from '@gyomu/schema/snapshot'

const toMap = (snapshot: FileHashSnapshot): Map<ProjectRelativePath, any> => {
  return new Map(snapshot.files.map((f) => [f.projectRelativePath, f]))
}

/**
 * Compares two file hash snapshots to identify added, updated, and deleted file changes.
 *
 * @param previous The previous snapshot to compare from.
 *
 * @param current The current snapshot to compare to.
 *
 * @returns A collection of file changes representing the differences between the two snapshots.
 */
export const diffSnapshot = (
  previous: FileHashSnapshot,
  current: FileHashSnapshot,
): ReadonlyArray<FileChange> => {
  const prevMap = toMap(previous)
  const currMap = toMap(current)

  const changes: Array<FileChange> = []

  // deleted + updated + unchanged detection
  for (const [projectRelativePath, prev] of prevMap) {
    const curr = currMap.get(projectRelativePath)

    if (!curr) {
      changes.push({
        type: 'deleted',
        projectRelativePath,
        previous: prev,
      })
      continue
    }

    if (prev.rawHash !== curr.rawHash) {
      changes.push({
        type: 'updated',
        projectRelativePath,
        previous: prev,
        current: curr,
      })
    }
  }

  // added detection
  for (const [projectRelativePath, curr] of currMap) {
    if (!prevMap.has(projectRelativePath)) {
      changes.push({
        type: 'added',
        projectRelativePath,
        current: curr,
      })
    }
  }

  return changes
}
