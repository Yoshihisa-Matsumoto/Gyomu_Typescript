import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import type { MemberIdentity } from '@gyomu/schema/typescript'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'

export const createMemberIdentityAndId = (
  identity: MemberIdentity,
  parentIdentity: SymbolIdentity,
): { id: SymbolId; identity: SymbolIdentity } => {
  return {
    id: SymbolId(
      `${identity.ownerSymbolId}::${identity.memberPath.join('.')}::${identity.signatureId}`,
    ),
    identity: {
      signatureId: SignatureId(identity.signatureId),
      symbolId: SymbolId(
        `${parentIdentity.symbolId}::${parentIdentity.signatureId}::${identity.memberPath.join('.')}::${identity.signatureId}`,
      ),
    },
  }
}
