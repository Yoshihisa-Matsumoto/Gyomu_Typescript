/**
 * Structural and logical complexity analysis.
 */
export interface ComplexityMetrics {
  nestingDepth: number

  optionalCount: number

  unionCount: number

  genericDepth: number

  parameterCount: number

  returnTypeDepth: number

  referencedTypeCount: number

  /**
   * Effect-specific complexity score.
   */
  effectComplexity?: number
}
