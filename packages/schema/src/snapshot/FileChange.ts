import type { ProjectRelativePath } from '../typescript/types.js'
import type { FileHashEntry } from './FileHashEntry.js'

export type FileChangeType = 'added' | 'updated' | 'deleted'

export interface FileChange {
  readonly type: FileChangeType
  readonly path: ProjectRelativePath
  readonly previous?: FileHashEntry
  readonly current?: FileHashEntry
}
