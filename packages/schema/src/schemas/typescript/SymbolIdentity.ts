import { Schema } from 'effect'

export const SymbolIdentity = Schema.Struct({
  symbolId: Schema.String.annotate({
    description: 'Stable symbol identifier',
  }),

  signatureId: Schema.String.annotate({
    description: 'Identifier for function signature, used to disambiguate overloads',
  }),
})

export type SymbolIdentity = Schema.Schema.Type<typeof SymbolIdentity>

export const equalSymbolIdentity = (a: SymbolIdentity, b: SymbolIdentity): boolean =>
  a.symbolId === b.symbolId && a.signatureId === b.signatureId

export const toIdentityKey = (identity: SymbolIdentity): string =>
  `${identity.symbolId}:%%:${identity.signatureId}`

export const toSymbolIdentity = (identityKey: string): SymbolIdentity => {
  const index = identityKey.lastIndexOf(':%%:')
  return {
    symbolId: identityKey.substring(0, index),
    signatureId: identityKey.substring(index + 4),
  }
}
