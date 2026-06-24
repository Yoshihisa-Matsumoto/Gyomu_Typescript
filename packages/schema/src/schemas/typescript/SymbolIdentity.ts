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
