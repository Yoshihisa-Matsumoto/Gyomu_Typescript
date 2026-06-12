import type { ComplexityMetrics } from './ComplexityMetrics.js'

export const computeComplexityScore = (metrics: ComplexityMetrics): number => {
  let score = 0

  if (metrics.effectComplexity) score += metrics.effectComplexity
  if (metrics.genericDepth > 0) score += 1
  if (metrics.nestingDepth) score += metrics.nestingDepth

  if (metrics.optionalCount) score += 1
  if (metrics.parameterCount > 3) score += 1
  if (metrics.referencedTypeCount > 0) score += metrics.referencedTypeCount
  if (metrics.returnTypeDepth > 0) score += 2
  if (metrics.unionCount > 0) score += 1

  return score
}
