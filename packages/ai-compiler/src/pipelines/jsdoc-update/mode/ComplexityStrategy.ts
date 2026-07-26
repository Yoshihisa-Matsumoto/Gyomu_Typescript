import type { ModeContext } from './ModeContext.js'

/**
 * Defines a strategy for determining the complexity of a code transformation task.
 */
export interface ComplexityStrategy {
  /**
   * Evaluates whether the given transformation context is considered complex.
   *
   * @param context The transformation context containing information about the operation.
   *
   * @returns True if the context is complex, false otherwise.
   */
  isComplex: (context: ModeContext) => boolean
}

/**
 * A default implementation of ComplexityStrategy that marks tasks as complex if the symbol's complexity score is 5 or greater.
 */
export const defaultComplexityStrategy: ComplexityStrategy = {
  isComplex: (context) => context.symbol.complexityScore >= 5,
}
