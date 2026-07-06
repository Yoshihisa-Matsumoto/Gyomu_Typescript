import { Schema } from 'effect'

export const NonDocumentableMember = Schema.Struct({
  documentable: Schema.Literal(false),
})

export type NonDocumentableMember = Schema.Schema.Type<typeof NonDocumentableMember>
