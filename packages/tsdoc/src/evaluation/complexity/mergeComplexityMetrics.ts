import { emptyComplexityMetrics } from './emptyComplexityMetrics.js'
import type { ComplexityMetrics } from './ComplexityMetrics.js'

export const mergeComplexityMetrics = (
  metricsArray: Array<ComplexityMetrics>,
): ComplexityMetrics => {
  return metricsArray.reduce(
    (acc, metrics) => ({
      nestingDepth: Math.max(acc.nestingDepth, metrics.nestingDepth),

      parameterCount: acc.parameterCount + metrics.parameterCount,
      optionalCount: acc.optionalCount + metrics.optionalCount,

      unionCount: acc.unionCount + metrics.unionCount,
      referencedTypeCount: acc.referencedTypeCount + metrics.referencedTypeCount,

      genericDepth: Math.max(acc.genericDepth, metrics.genericDepth),
      returnTypeDepth: Math.max(acc.returnTypeDepth, metrics.returnTypeDepth),
      effectComplexity: (acc.effectComplexity ?? 0) + (metrics.effectComplexity ?? 0),
      schemaComplexity: (acc.schemaComplexity ?? 0) + (metrics.schemaComplexity ?? 0),
    }),
    emptyComplexityMetrics(),
  )
}
