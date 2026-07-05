import { Schema } from 'effect'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents a union type structure.
 */
export type UnionStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'union'

  /**
   * The member types of the union.
   */
  types: ReadonlyArray<TypeAnalysis>
}

/**
 * Represents a union type structure.
 */
export const UnionStructureAnalysis: Schema.Schema<UnionStructureAnalysis> = Schema.Struct({
  /**
   * The classification of this structure.
   */
  kind: Schema.Literal('union').annotate({
    description: 'The classification of this structure.',
  }),

  /**
   * The member types of the union.
   */
  types: Schema.Array(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'The member types of the union.',
  }),
}).annotate({
  description: 'Represents a union type structure.',
})
