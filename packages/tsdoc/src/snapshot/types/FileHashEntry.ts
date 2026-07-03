import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Cached hash entry for a source file.
 *
 * Used to determine whether a file requires
 * re-analysis or TSDoc regeneration.
 */
export interface FileHashEntry {
  /**
   * Relative file path from project root.
   */
  path: ProjectRelativePath

  /**
   * Raw source hash including comments and formatting.
   */
  rawHash: string

  /**
   * Semantic hash generated from normalized AST structure.
   *
   * Used to ignore formatting-only or comment-only changes.
   */
  semanticHash?: string

  /**
   * ISO timestamp of the latest hash update.
   */
  updatedAt: string
}
