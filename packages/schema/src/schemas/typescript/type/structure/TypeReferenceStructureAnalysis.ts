import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents a reference to another type identifier.
 */
export type TypeReferenceStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'reference'

  /**
   * The identifier of the referenced type.
   */
  targetId: string

  /**
   * The type of the generics parameters.
   */
  typeParameters: ReadonlyArray<TypeAnalysis>
} & StructureBase

/**
 * Represents a reference to another type identifier.
 */
export const TypeReferenceStructureAnalysis: Schema.Schema<TypeReferenceStructureAnalysis> =
  Schema.Struct({
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

    /**
     * The type of the generics parameters.
     */
    typeParameters: Schema.Array(Schema.suspend(() => TypeAnalysis)).annotate({
      description: `The type of the generics parameters.`,
    }),
  })
    .pipe(Schema.fieldsAssign(StructureBase.fields))
    .annotate({
      description: 'Represents a reference to another type identifier.',
    })
