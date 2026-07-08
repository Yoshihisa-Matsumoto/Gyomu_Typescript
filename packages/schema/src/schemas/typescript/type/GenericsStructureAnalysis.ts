import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents an generics structure.
 */
export type GenericsStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'generics'

  /**
   * The type of the generics parameters.
   */
  typeParameters: ReadonlyArray<TypeAnalysis>
} & StructureBase

/**
 * Represents an generics structure.
 */
export const GenericsStructureAnalysis: Schema.Schema<GenericsStructureAnalysis> = Schema.Struct({
  /**
   * The classification of this structure.
   */
  kind: Schema.Literal('generics').annotate({
    description: 'The classification of this structure.',
  }),

  /**
   * The type of the generics parameters.
   */
  typeParameters: Schema.Array(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'The type of the generics parameters.',
  }),
})
  .pipe(Schema.fieldsAssign(StructureBase.fields))
  .annotate({
    description: 'Represents an generics structure.',
  })
