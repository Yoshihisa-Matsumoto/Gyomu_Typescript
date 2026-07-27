import { Schema } from 'effect'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Defines semantic signals for an Effect type, capturing success, error, and requirement dependencies.
 */
export interface EffectSignals {
  /**
   * Indicates whether the symbol returns an Effect.
   */
  returnsEffect: boolean

  /**
   * The type analysis of the success value.
   */
  success: TypeAnalysis

  /**
   * The type analysis of the error, if present.
   */
  error?: TypeAnalysis | undefined

  /**
   * The type analysis of the required context or environment, if present.
   */
  requirements?: TypeAnalysis | undefined

  /**
   * Indicates whether the Effect definition specifies an error type.
   */
  hasErrorType: boolean

  /**
   * Indicates whether the Effect definition specifies requirements or context.
   */
  hasRequirementsType: boolean

  /**
   * The estimated nesting depth of the Effect, if measurable.
   */
  effectDepth?: number | undefined
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
  error: Schema.optional(
    Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
  ).annotate({
    description: 'Error type.',
  }),

  /**
   * Required context/environment type.
   */
  requirements: Schema.optional(
    Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
  ).annotate({
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
  effectDepth: Schema.optional(Schema.Union([Schema.Number, Schema.Undefined])).annotate({
    description: 'Estimated Effect nesting depth.',
  }),
}).annotate({
  description:
    'Defines semantic signals for an Effect type, capturing success, error, and requirement dependencies.',
})
