/**
 * Structural and logical complexity analysis.
 */
export interface ComplexityMetrics {
  /**
   * The maximum nesting level of the structure.
   */
  nestingDepth: number

  /**
   * The number of optional fields found.
   */
  optionalCount: number

  /**
   * The number of union types found.
   */
  unionCount: number

  /**
   * The maximum nesting depth of generics.
   */
  genericDepth: number

  /**
   * The total number of parameters in the signature.
   */
  parameterCount: number

  /**
   * The complexity depth of the return type.
   */
  returnTypeDepth: number

  /**
   * The number of unique types referenced.
   */
  referencedTypeCount: number

  /**
   * Effect-specific complexity score.
   */
  effectComplexity?: number

  /**
   * Schema-specific complexity score.
   */
  schemaComplexity?: number
}
