import type { EffectSignals } from '@gyomu/schema/schemas/typescript'

/**
 * Computes the cyclomatic complexity score of an effect signal based on its depth, return type, error structure, and requirements.
 *
 * @param effectSignal The effect signal to evaluate for complexity.
 *
 * @returns A numeric complexity score representing the nested structure of the effect.
 */
export const computeEffectComplexity = (effectSignal: EffectSignals): number => {
  let complexity = 1
  if (effectSignal.effectDepth) complexity += effectSignal.effectDepth - 1
  if (effectSignal.returnsEffect) complexity += 2
  if (effectSignal.error) {
    let errorComplexity = 0
    if (effectSignal.error.structure) {
      if (effectSignal.error.structure.kind == 'union')
        errorComplexity += effectSignal.error.structure.types.length * 2
    }
    if (errorComplexity == 0) errorComplexity += 2
    complexity += errorComplexity
  }
  if (effectSignal.requirements) {
    let requirementComplexity = 0
    if (effectSignal.requirements.structure)
      if (effectSignal.requirements.structure.kind == 'union')
        requirementComplexity += effectSignal.requirements.structure.types.length * 3
    if (requirementComplexity == 0) requirementComplexity += 3
    complexity += requirementComplexity
  }

  return complexity
}
