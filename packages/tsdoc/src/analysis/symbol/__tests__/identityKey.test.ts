import { expect, it } from 'vitest'
import { toIdentityKey, toSymbolIdentity } from '../SymbolAnalysis.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'

it('toSymbolIdentity test', () => {
  const from: SymbolIdentity = {
    signatureId: 'abc',
    symbolId: 'def',
  }
  const to = toSymbolIdentity(toIdentityKey(from))
  expect(to.signatureId).toBe(from.signatureId)
  expect(to.symbolId).toBe(from.symbolId)
})

it('toSymbolIdentity for complex', () => {
  const from: SymbolIdentity = {
    signatureId:
      '(id:string):Effect.Effect<Schema.Schema.Type<Select> | undefined, DBError, never>',
    symbolId:
      'CrudRepository::type::findById::(id:string):Effect.Effect<Schema.Schema.Type<Select> | undefined, DBError, never>',
  }
  const to = toSymbolIdentity(toIdentityKey(from))
  expect(to.signatureId).toBe(from.signatureId)
  expect(to.symbolId).toBe(from.symbolId)
})
