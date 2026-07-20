import type { ComplexityMetrics } from './ComplexityMetrics.js'

export const emptyComplexityMetrics = (): ComplexityMetrics => ({
  nestingDepth: 0,
  parameterCount: 0,
  optionalCount: 0,
  unionCount: 0,
  referencedTypeCount: 0,
  genericDepth: 0,
  returnTypeDepth: 0,
})
