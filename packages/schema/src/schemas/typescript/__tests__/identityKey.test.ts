import { expect, it } from 'vitest'
import { toIdentityKey, toSymbolIdentity } from '../SymbolIdentity.js'
import { SignatureId, SymbolId } from '../../../typescript/types.js'
import type { SymbolIdentity } from '../SymbolIdentity.js'

it('toSymbolIdentity test', () => {
  const from: SymbolIdentity = {
    signatureId: SignatureId('abc'),
    symbolId: SymbolId('def'),
  }
  const to = toSymbolIdentity(toIdentityKey(from))
  expect(to.signatureId).toBe(from.signatureId)
  expect(to.symbolId).toBe(from.symbolId)
})

it('toSymbolIdentity for complex', () => {
  const from: SymbolIdentity = {
    signatureId: SignatureId(
      '(id:string):Effect.Effect<Schema.Schema.Type<Select> | undefined, DBError, never>',
    ),
    symbolId: SymbolId(
      'CrudRepository::type::findById::(id:string):Effect.Effect<Schema.Schema.Type<Select> | undefined, DBError, never>',
    ),
  }
  const to = toSymbolIdentity(toIdentityKey(from))
  expect(to.signatureId).toBe(from.signatureId)
  expect(to.symbolId).toBe(from.symbolId)
})
