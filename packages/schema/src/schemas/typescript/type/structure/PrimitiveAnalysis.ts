import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'

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
})
  .pipe(Schema.fieldsAssign(StructureBase.fields))
  .annotate({
    description: 'Represents a primitive type.',
  })

/**
 * Represents a primitive type.
 */
export type PrimitiveAnalysis = typeof PrimitiveAnalysis.Type
