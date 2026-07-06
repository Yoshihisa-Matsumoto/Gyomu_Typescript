import { Schema } from 'effect'
import { TypeProperty } from './TypeProperty.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents an object structure.
 */
export type ObjectStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'object'

  /**
   * Nested object members.
   */
  members: ReadonlyArray<TypeProperty> | undefined
} & StructureBase

/**
 * Represents an object structure.
 */
export const ObjectStructureAnalysis: Schema.Schema<ObjectStructureAnalysis> = Schema.Struct({
  kind: Schema.Literal('object'),

  members: Schema.Union([Schema.Array(Schema.suspend(() => TypeProperty)), Schema.Undefined]),
}).pipe(Schema.fieldsAssign(StructureBase.fields))
