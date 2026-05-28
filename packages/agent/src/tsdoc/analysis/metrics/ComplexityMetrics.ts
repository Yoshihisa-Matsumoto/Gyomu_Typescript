/**
 * Structural and logical complexity analysis.
 */
export interface ComplexityMetrics {
  /**
   * Cyclomatic complexity score.
   */
  cyclomaticComplexity?: number

  /**
   * Cognitive complexity score.
   */
  cognitiveComplexity?: number

  /**
   * Maximum nesting depth.
   */
  nestingDepth: number

  /**
   * Number of conditional branches.
   */
  branchCount: number

  /**
   * Number of async execution boundaries.
   */
  asyncBoundaryCount: number

  /**
   * Generic nesting depth.
   */
  genericDepth: number

  /**
   * Union type complexity score.
   */
  unionComplexity: number

  /**
   * Aggregate type complexity score.
   */
  typeComplexity: number

  /**
   * Effect-specific complexity score.
   */
  effectComplexity?: number
}
