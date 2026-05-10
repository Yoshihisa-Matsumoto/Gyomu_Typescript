import { describe, expect, it, vi } from 'vitest'
import { Schema } from 'effect'
import * as entityModule from '@gyomu/core/entity'
import { validateWithSchema } from '../validate'

// モック対象

describe('validateWithSchema', () => {
  const TestSchema = Schema.Struct({
    name: Schema.String,
    age: Schema.Number,
  }) as any // CrudSchemaTypeとして扱う

  it('should return ok: true and data when validation succeeds', () => {
    const input = { name: 'Taro', age: 20 }

    const result = validateWithSchema(TestSchema, input)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(input)
    }
  })

  it('should return ok: false and mapped errors when validation fails', () => {
    const input = { name: 'Taro', age: 'invalid' }

    // resolveFieldErrorsFromIssue をモック
    const mockErrors = new Map<string, Array<string>>().set('age', [
      'Expected number, received string',
    ])

    const spy = vi.spyOn(entityModule, 'resolveFieldErrorsFromIssue').mockReturnValue(mockErrors)

    const result = validateWithSchema(TestSchema, input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toEqual(mockErrors)
    }

    expect(spy).toHaveBeenCalled()
  })

  it('should pass schema and failure to resolveFieldErrorsFromIssue', () => {
    const input = { name: 'Taro', age: 'invalid' }
    const mockErrors = new Map<string, Array<string>>().set('age', [
      'Expected number, received string',
    ])

    const spy = vi.spyOn(entityModule, 'resolveFieldErrorsFromIssue').mockReturnValue(mockErrors)

    validateWithSchema(TestSchema, input)

    expect(spy).toHaveBeenCalledWith(
      TestSchema,
      expect.anything(), // failure
    )
  })

  it('should not call resolveFieldErrorsFromIssue when success', () => {
    const input = { name: 'Taro', age: 20 }

    const spy = vi.spyOn(entityModule, 'resolveFieldErrorsFromIssue')

    validateWithSchema(TestSchema, input)

    expect(spy).not.toHaveBeenCalled()
  })
})
