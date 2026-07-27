import type { ComplexityMetrics } from './ComplexityMetrics.js'

/**
 * Provides a base ComplexityMetrics object initialized with zero values.
 *
 * @returns A ComplexityMetrics object with all fields set to 0.
 */
export const emptyComplexityMetrics = (): ComplexityMetrics => ({
  nestingDepth: 0,
  parameterCount: 0,
  optionalCount: 0,
  unionCount: 0,
  referencedTypeCount: 0,
  genericDepth: 0,
  returnTypeDepth: 0,
})
