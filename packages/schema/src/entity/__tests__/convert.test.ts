import { describe, expect, it } from 'vitest'
import { Effect, Schema } from 'effect'
import {
  convertFromSchemaObjectWithEffect,
  convertToSchemaObjectWithEffect,
  convertToSchemaObjectWithResult,
  jsonString2SchemaObjectWithoutEffect,
} from '../convert.js'

// ---- スキーマ ----
const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
})

describe('jsonString2SchemaObjectWithoutEffect', () => {
  it('正常系: JSON文字列をSchemaオブジェクトに変換できる', () => {
    const json = JSON.stringify({ id: 1, name: 'Alice' })

    const result = jsonString2SchemaObjectWithoutEffect(UserSchema, json)

    expect(result).toEqual({ id: 1, name: 'Alice' })
  })

  it('異常系: 不正なJSONで例外が投げられる', () => {
    const invalidJson = '{ id: 1, name: Alice }'

    expect(() => jsonString2SchemaObjectWithoutEffect(UserSchema, invalidJson)).toThrow()
  })

  it('異常系: schemaに合わない場合例外が投げられる', () => {
    const json = JSON.stringify({ id: 'invalid', name: 'Alice' })

    expect(() => jsonString2SchemaObjectWithoutEffect(UserSchema, json)).toThrow()
  })
})

describe('convertToSchemaObjectWithEffect', () => {
  const convert = convertToSchemaObjectWithEffect('UserSchema')

  it('正常系: 正しい入力をデコードできる', async () => {
    const effect = convert(UserSchema, { id: 1, name: 'Bob' })

    const result = await Effect.runPromise(effect)

    expect(result).toEqual({ id: 1, name: 'Bob' })
  })

  it('異常系: 不正な入力でAppErrorに変換される', async () => {
    const effect = convert(UserSchema, { id: 'invalid', name: 'Bob' })

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: '@gyomu/schema/SchemaErrorContext',
    })
  })
})

describe('convertFromSchemaObjectWithEffect', () => {
  const convert = convertFromSchemaObjectWithEffect('UserSchema')

  it('正常系: 正しいオブジェクトをエンコードできる', async () => {
    const input = { id: 2, name: 'Charlie' }

    const effect = convert(UserSchema, input)

    const result = await Effect.runPromise(effect)

    expect(result).toEqual(input)
  })

  it('異常系: 不正なオブジェクトでAppErrorに変換される', async () => {
    const invalidInput = { id: 'invalid', name: 'Charlie' } as any

    const effect = convert(UserSchema, invalidInput)

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: '@gyomu/schema/SchemaErrorContext',
    })
  })
})

describe('convertToSchemaObjectWithResult', () => {
  const UserSchema2 = Schema.Struct({
    name: Schema.String,
    age: Schema.Number,
  })

  it('should return success result for valid input', () => {
    const input = { name: 'Taro', age: 20 }

    const result = convertToSchemaObjectWithResult(UserSchema2, input)

    expect(result._tag).toBe('Success')
    if (result._tag === 'Success') {
      expect(result.success).toEqual(input)
    }
  })

  it('should return failure result for invalid input (type mismatch)', () => {
    const input = { name: 'Taro', age: '20' } // ageがstring

    const result = convertToSchemaObjectWithResult(UserSchema2, input)

    expect(result._tag).toBe('Failure')
    if (result._tag === 'Failure') {
      expect(result.failure).toBeDefined()
    }
  })

  it('should return failure result when required field is missing', () => {
    const input = { name: 'Taro' } // ageなし

    const result = convertToSchemaObjectWithResult(UserSchema2, input)

    expect(result._tag).toBe('Failure')
  })

  it('should ignore extra fields if schema allows stripping', () => {
    const input = { name: 'Taro', age: 20, extra: 'ignore me' }

    const result = convertToSchemaObjectWithResult(UserSchema2, input)

    expect(result._tag).toBe('Success')
    if (result._tag === 'Success') {
      expect(result.success).toEqual({
        name: 'Taro',
        age: 20,
      })
    }
  })
})
