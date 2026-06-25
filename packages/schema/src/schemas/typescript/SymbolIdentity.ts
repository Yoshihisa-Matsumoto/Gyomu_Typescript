import { Schema } from 'effect'

/**
 * Represents the unique identity of a symbol, composed of a stable symbol identifier and a signature identifier.
 */
export const SymbolIdentity = Schema.Struct({
  symbolId: Schema.String.annotate({
    description: 'Stable symbol identifier',
  }),

  signatureId: Schema.String.annotate({
    description: 'Identifier for function signature, used to disambiguate overloads',
  }),
})

/**
 * TypeScript type for SymbolIdentity.
 */
export type SymbolIdentity = Schema.Schema.Type<typeof SymbolIdentity>

/**
 * Compares two SymbolIdentity objects for equality.
 *
 * @param a The first identity to compare.
 *
 * @param b The second identity to compare.
 *
 * @returns True if both identities are equal, false otherwise.
 */
export const equalSymbolIdentity = (a: SymbolIdentity, b: SymbolIdentity): boolean =>
  a.symbolId === b.symbolId && a.signatureId === b.signatureId

/**
 * Serializes a SymbolIdentity into a string key.
 *
 * @param identity The identity to serialize.
 *
 * @returns A string representation of the identity.
 */
export const toIdentityKey = (identity: SymbolIdentity): string =>
  `${identity.symbolId}:%%:${identity.signatureId}`

/**
 * Deserializes a string key back into a SymbolIdentity.
 *
 * @param identityKey The serialized identity string.
 *
 * @returns The deserialized SymbolIdentity object.
 */
export const toSymbolIdentity = (identityKey: string): SymbolIdentity => {
  const index = identityKey.lastIndexOf(':%%:')
  return {
    symbolId: identityKey.substring(0, index),
    signatureId: identityKey.substring(index + 4),
  }
}
