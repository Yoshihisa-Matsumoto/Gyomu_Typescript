import { Schema } from 'effect'
import { SchemaAnnotations } from '../SchemaAnnotations.js'

/**
 * Represents a base structure
 */
export const StructureBase = Schema.Struct({
  annotations: Schema.optional(SchemaAnnotations),
}).annotate({
  description: 'Represents a  base structure',
})

/**
 * Defines the static type of the StructureBase schema, containing optional annotations.
 */
export type StructureBase = typeof StructureBase.Type
