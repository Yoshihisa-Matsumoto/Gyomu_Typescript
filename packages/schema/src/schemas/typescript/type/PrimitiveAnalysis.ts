import { Schema } from 'effect'

/**
 * Represents a primitive type.
 */
export const PrimitiveAnalysis = Schema.Struct({
  /**
   * The classification of this structure.
   */
  kind: Schema.Literal('primitive').annotate({
    description: 'The classification of this structure.',
  }),

  /**
   * The name of the primitive type.
   */
  elementType: Schema.String.annotate({
    description: 'The name of the primitive type.',
  }),
}).annotate({
  description: 'Represents a primitive type.',
})

export type PrimitiveAnalysis = typeof PrimitiveAnalysis.Type
