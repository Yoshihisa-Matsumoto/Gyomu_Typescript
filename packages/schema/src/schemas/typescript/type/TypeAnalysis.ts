import { Schema } from 'effect'
import { TypeSource } from '../TypeSource.js'
import { TypeStructureAnalysis } from './TypeStructureAnalysis.js'
import { EffectSignals } from './EffectSignals.js'

/**
 * Represents the analysis of a TypeScript type, including its text representation, origin, structural details, and any associated Effect-related signals.
 */
export interface TypeAnalysis {
  /**
   * The string representation of the type.
   */
  text: string

  /**
   * The source system that generated the type analysis.
   */
  source: TypeSource

  /**
   * Nested object members.
   */
  structure?: TypeStructureAnalysis | undefined

  /**
   * Effect-related semantic signals.
   */
  effect?: EffectSignals | undefined
}

/**
 * Represents the analysis of a TypeScript type, including its text representation, origin, structural details, and any associated Effect-related signals.
 */
export const TypeAnalysis: Schema.Schema<TypeAnalysis> = Schema.Struct({
  /**
   * The string representation of the type.
   */
  text: Schema.String.annotate({
    description: 'The string representation of the type.',
  }),

  /**
   * The source system that generated the type analysis.
   */
  source: TypeSource.annotate({
    description: 'The source system that generated the type analysis.',
  }),

  /**
   * Nested object members.
   */
  structure: Schema.optionalKey(Schema.suspend(() => TypeStructureAnalysis)).annotate({
    description: 'Nested object members.',
  }),

  /**
   * Effect-related semantic signals.
   */
  effect: Schema.optionalKey(Schema.suspend(() => EffectSignals)).annotate({
    description: 'Effect-related semantic signals.',
  }),
}).annotate({
  description:
    'Represents the analysis of a TypeScript type, including its text representation, origin, structural details, and any associated Effect-related signals.',
})
