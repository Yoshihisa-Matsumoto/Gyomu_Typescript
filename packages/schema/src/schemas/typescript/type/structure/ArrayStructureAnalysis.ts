import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents an array structure.
 */
export type ArrayStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'array'

  /**
   * The type of the array elements.
   */
  elementType: TypeAnalysis
} & StructureBase

/**
 * Represents an array structure.
 */
export const ArrayStructureAnalysis: Schema.Schema<ArrayStructureAnalysis> = Schema.Struct({
  /**
   * The classification of this structure.
   */
  kind: Schema.Literal('array').annotate({
    description: 'The classification of this structure.',
  }),

  /**
   * The type of the array elements.
   */
  elementType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'The type of the array elements.',
  }),
})
  .pipe(Schema.fieldsAssign(StructureBase.fields))
  .annotate({
    description: 'Represents an array structure.',
  })

// export type ArrayStructureAnalysis = typeof ArrayStructureAnalysis.Type
