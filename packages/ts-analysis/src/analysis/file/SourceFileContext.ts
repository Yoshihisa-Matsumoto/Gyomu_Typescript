import type { SourceFile } from 'ts-morph'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Represents the context of a source file, including its ts-morph representation and canonical project path.
 */
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
