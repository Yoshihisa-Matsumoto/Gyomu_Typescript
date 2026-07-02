import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type { MemberIdentity, SymbolId } from '@gyomu/schema/typescript'

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
