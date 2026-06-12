import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type { MemberIdentity } from '@gyomu/schema/typescript'
import type { SymbolId } from '../types.js'

export const createMemberIdentityAndId = (
  identity: MemberIdentity,
  parentIdentity: SymbolIdentity,
): { id: SymbolId; identity: SymbolIdentity } => {
  return {
    id: `${identity.ownerSymbolId}::${identity.memberPath.join('.')}::${identity.signatureId}`,
    identity: {
      signatureId: identity.signatureId,
      symbolId: `${parentIdentity.symbolId}::${parentIdentity.signatureId}::${identity.memberPath.join('.')}::${identity.signatureId}`,
    },
  }
}
