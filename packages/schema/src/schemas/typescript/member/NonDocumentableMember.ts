import { Schema } from 'effect'

/**
 * Defines a schema for a non-documentable member, characterized by a 'documentable' literal field set to false.
 */
export const NonDocumentableMember = Schema.Struct({
  documentable: Schema.Literal(false),
})

/**
 * Represents the inferred type for the NonDocumentableMember schema.
 */
export type NonDocumentableMember = Schema.Schema.Type<typeof NonDocumentableMember>
