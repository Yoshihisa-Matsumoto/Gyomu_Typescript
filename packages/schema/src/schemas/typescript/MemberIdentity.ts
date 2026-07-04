import { Schema } from 'effect'
import { MemberIdentityMemberPath } from './MemberIdentityMemberPath.js'

export const MemberIdentity = Schema.Struct({
  ownerSymbolId: Schema.String.pipe(Schema.brand('SymbolId')).annotate({
    description: 'The identifier of the symbol that owns this member.',
  }),

  memberPath: MemberIdentityMemberPath.annotate({
    description: 'The path to the member within the owning symbol.',
  }),
  signatureId: Schema.String.pipe(Schema.brand('SignatureId')).annotate({
    description: 'The signature identifier, used to distinguish overloaded members.',
  }),
}).annotate({
  description: 'Unique identifier for a class or object member.',
})

export type MemberIdentity = Schema.Schema.Type<typeof MemberIdentity>
