import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'

/**
 * Represents a reference to another type identifier.
 */
export const TypeReferenceStructureAnalysis = Schema.Struct({
  /**
   * The classification of this structure.
   */
  kind: Schema.Literal('reference').annotate({
    description: 'The classification of this structure.',
  }),

  /**
   * The identifier of the referenced type.
   */
  targetId: Schema.String.annotate({
    description: 'The identifier of the referenced type.',
  }),
})
  .pipe(Schema.fieldsAssign(StructureBase.fields))
  .annotate({
    description: 'Represents a reference to another type identifier.',
  })

/**
 * Represents the inferred type for TypeReferenceStructureAnalysis.
 */
export type TypeReferenceStructureAnalysis = typeof TypeReferenceStructureAnalysis.Type
