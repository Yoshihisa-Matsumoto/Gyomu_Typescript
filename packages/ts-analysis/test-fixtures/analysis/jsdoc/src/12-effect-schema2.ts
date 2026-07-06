import { Schema } from 'effect'
import { LineRange } from './11-effect-schema.js'

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
  .pipe(Schema.fieldsAssign(LineRange.fields))
  .annotate({
    description: `Represents a reference to another type identifier.`,
  })

export type TypeReferenceStructureAnalysis = typeof TypeReferenceStructureAnalysis.Type
