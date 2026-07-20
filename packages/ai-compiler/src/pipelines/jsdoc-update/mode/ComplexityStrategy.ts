import type { ModeContext } from './ModeContext.js'

export interface ComplexityStrategy {
  isComplex: (context: ModeContext) => boolean
}
export const defaultComplexityStrategy: ComplexityStrategy = {
  isComplex: (context) => context.symbol.complexityScore >= 5,
}
