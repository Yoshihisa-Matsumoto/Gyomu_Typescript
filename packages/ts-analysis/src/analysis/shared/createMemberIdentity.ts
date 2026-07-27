import { SignatureId, SymbolId } from '@gyomu/schema/typescript'

import type { MemberIdentity, SymbolIdentity } from '@gyomu/schema/schemas/typescript'

/**
 * Creates a combined member identity and symbol ID based on a parent symbol and member path.
 *
 * @param identity The identity of the member to transform.
 *
 * @param parentIdentity The identity of the parent symbol.
 *
 * @returns An object containing the generated SymbolId and the new SymbolIdentity.
 */
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
