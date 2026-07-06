import { Schema } from 'effect'
import { MemberIdentityMemberPath } from './MemberIdentityMemberPath.js'

/**
 * Unique identifier for a class or object member, composed of the owning symbol, its path, and an optional signature identifier.
 */
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

/**
 * Represents the TypeScript type definition for a MemberIdentity.
 */
export type MemberIdentity = Schema.Schema.Type<typeof MemberIdentity>
