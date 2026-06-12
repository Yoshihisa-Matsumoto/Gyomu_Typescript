import type { EffectSignals } from '@gyomu/schema/typescript'

export const computeEffectComplexity = (effectSignal: EffectSignals): number => {
  let complexity = 1
  if (effectSignal.effectDepth) complexity += effectSignal.effectDepth - 1
  if (effectSignal.returnsEffect) complexity += 2
  if (effectSignal.error) {
    if (effectSignal.error.structure) {
      if (effectSignal.error.structure.kind == 'union')
        complexity += effectSignal.error.structure.types.length * 2
    }
  }
  if (effectSignal.requirements) {
    if (effectSignal.requirements.structure)
      if (effectSignal.requirements.structure.kind == 'union')
        complexity += effectSignal.requirements.structure.types.length * 3
  }

  return complexity
}
