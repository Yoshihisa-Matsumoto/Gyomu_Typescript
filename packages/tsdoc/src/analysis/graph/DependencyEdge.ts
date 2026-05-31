/**
 * Dependency relationship between source files.
 */
export interface DependencyEdge {
  /**
   * Source file path.
   */
  from: string

  /**
   * Target file path.
   */
  to: string

  /**
   * Dependency relationship category.
   */
  type: 'import' | 'type-import' | 're-export'
}
