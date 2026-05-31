import type { SourceFile } from 'ts-morph'
import type { ProjectRelativePath } from '../types.js'

export interface SourceFileContext {
  /**
   * ts-morph source file.
   */
  sourceFile: SourceFile

  /**
   * Canonical project-relative path.
   */
  path: ProjectRelativePath
}
