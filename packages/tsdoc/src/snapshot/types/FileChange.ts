import type { FileHashEntry } from './FileHashEntry.js'

export type FileChangeType = 'added' | 'updated' | 'deleted'

export interface FileChange {
  readonly type: FileChangeType
  readonly path: string
  readonly previous?: FileHashEntry
  readonly current?: FileHashEntry
}
