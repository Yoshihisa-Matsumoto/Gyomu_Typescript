import { Schema } from 'effect'
import { TypeProperty } from '../TypeProperty.js'
import { IndexSignatureAnalysis } from '../IndexedSignatureAnalysis.js'
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
  properties: ReadonlyArray<TypeProperty> | undefined

  /**
   * Nested object indexed signature
   */
  indexSignatures: ReadonlyArray<IndexSignatureAnalysis> | undefined
} & StructureBase

/**
 * Defines an Effect schema for an object structure, including the literal 'object' classification and an optional array of property members.
 */
export const ObjectStructureAnalysis: Schema.Schema<ObjectStructureAnalysis> = Schema.Struct({
  kind: Schema.Literal('object'),

  properties: Schema.Union([Schema.Array(Schema.suspend(() => TypeProperty)), Schema.Undefined]),

  indexSignatures: Schema.Union([
    Schema.Array(Schema.suspend(() => IndexSignatureAnalysis)),
    Schema.Undefined,
  ]),
}).pipe(Schema.fieldsAssign(StructureBase.fields))
