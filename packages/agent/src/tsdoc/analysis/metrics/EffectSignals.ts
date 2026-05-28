/**
 * Effect-related semantic indicators.
 */
export interface EffectSignals {
  /**
   * Whether the symbol returns an Effect.
   */
  returnsEffect: boolean

  /**
   * Whether the Effect contains an error type.
   */
  hasErrorType: boolean

  /**
   * Whether the Effect contains requirements/context type.
   */
  hasRequirementsType: boolean

  /**
   * Estimated Effect nesting depth.
   */
  effectDepth?: number
  /**
   * Number of generic type arguments associated with Effect-related types.
   *
   * Examples:
   * - Effect<A, E, R> => 3
   * - Result<T, E> => 2
   * - Promise<User> => 1
   *
   * Used as a heuristic for estimating
   * type-level complexity and documentation needs.
   */
  effectGenericCount?: number
}
