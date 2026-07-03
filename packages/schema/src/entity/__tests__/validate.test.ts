import { describe, expect, it } from 'vitest'
import { AppInfoSchema } from '../../schemas/gyomu.js'
import { validateUnknowObject } from '../validate.js'

describe('validateUnknowObject', () => {
  it('returns success for valid string', () => {
    const result = validateUnknowObject(AppInfoSchema.selectSchema, 'description', 'john')
    expect(result._tag).toBe('Success')
  })

  it('returns failure for invalid string', () => {
    const result = validateUnknowObject(AppInfoSchema.selectSchema, 'description', 123)
    console.dir(result, { depth: null })
    expect(result._tag).toBe('Failure')
  })
  it('returns failure for too long string', () => {
    const result = validateUnknowObject(
      AppInfoSchema.selectSchema,
      'description',
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
    )
    console.dir(result, { depth: null })
    expect(result._tag).toBe('Failure')
  })
  it('validates id field', () => {
    const result = validateUnknowObject(AppInfoSchema.updateSchema, 'id', 20)
    console.dir(result)
    expect(result._tag).toBe('Failure')

    expect(validateUnknowObject(AppInfoSchema.updateSchema, 'id', 20)._tag).toBe('Failure')
  })
  it('validates optional field', () => {
    expect(validateUnknowObject(AppInfoSchema.updateSchema, 'description', undefined)._tag).toBe(
      'Success',
    )

    expect(validateUnknowObject(AppInfoSchema.updateSchema, 'description', 'abc')._tag).toBe(
      'Success',
    )
  })
})
