import type { FileHashSnapshot } from './types/FileHashSnapshot.js'
import type { FileChange } from '@gyomu/schema/snapshot'

const toMap = (snapshot: FileHashSnapshot): Map<string, any> => {
  return new Map(snapshot.files.map((f) => [f.path, f]))
}

export const diffSnapshot = (
  previous: FileHashSnapshot,
  current: FileHashSnapshot,
): ReadonlyArray<FileChange> => {
  const prevMap = toMap(previous)
  const currMap = toMap(current)

  const changes: Array<FileChange> = []

  // deleted + updated + unchanged detection
  for (const [path, prev] of prevMap) {
    const curr = currMap.get(path)

    if (!curr) {
      changes.push({
        type: 'deleted',
        path,
        previous: prev,
      })
      continue
    }

    if (prev.rawHash !== curr.rawHash) {
      changes.push({
        type: 'updated',
        path,
        previous: prev,
        current: curr,
      })
    }
  }

  // added detection
  for (const [path, curr] of currMap) {
    if (!prevMap.has(path)) {
      changes.push({
        type: 'added',
        path,
        current: curr,
      })
    }
  }

  return changes
}
