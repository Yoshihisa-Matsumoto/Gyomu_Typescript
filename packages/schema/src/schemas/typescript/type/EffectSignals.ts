import { Schema } from 'effect'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Defines semantic signals for an Effect type, capturing success, error, and requirement dependencies.
 */
export interface EffectSignals {
  /**
   * Whether the symbol returns an Effect.
   */
  returnsEffect: boolean

  /**
   * Success value type.
   */
  success: TypeAnalysis

  /**
   * Error type.
   */
  error: TypeAnalysis | undefined

  /**
   * Required context/environment type.
   */
  requirements: TypeAnalysis | undefined

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
  effectDepth: number | undefined
}

/**
 * Defines semantic signals for an Effect type, capturing success, error, and requirement dependencies.
 */
export const EffectSignals: Schema.Schema<EffectSignals> = Schema.Struct({
  /**
   * Whether the symbol returns an Effect.
   */
  returnsEffect: Schema.Boolean.annotate({
    description: 'Whether the symbol returns an Effect.',
  }),

  /**
   * Success value type.
   */
  success: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Success value type.',
  }),

  /**
   * Error type.
   */
  error: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]).annotate({
    description: 'Error type.',
  }),

  /**
   * Required context/environment type.
   */
  requirements: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]).annotate({
    description: 'Required context/environment type.',
  }),

  /**
   * Whether the Effect contains an error type.
   */
  hasErrorType: Schema.Boolean.annotate({
    description: 'Whether the Effect contains an error type.',
  }),

  /**
   * Whether the Effect contains requirements/context type.
   */
  hasRequirementsType: Schema.Boolean.annotate({
    description: 'Whether the Effect contains requirements/context type.',
  }),

  /**
   * Estimated Effect nesting depth.
   */
  effectDepth: Schema.Union([Schema.Number, Schema.Undefined]).annotate({
    description: 'Estimated Effect nesting depth.',
  }),
}).annotate({
  description:
    'Defines semantic signals for an Effect type, capturing success, error, and requirement dependencies.',
})
