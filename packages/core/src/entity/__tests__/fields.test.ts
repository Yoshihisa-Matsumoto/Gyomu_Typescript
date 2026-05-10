import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { BooleanFromString, schemaField } from '../fields.js'
import { convertFromSchemaObjectWithEffect, convertToSchemaObjectWithEffect } from '../convert.js'
import type { Schema } from 'effect'

// ----------------------
// helper
// ----------------------
const decode = <A>(schemaName: string, schema: Schema.Schema<A>, input: unknown) =>
  Effect.runPromise(
    convertToSchemaObjectWithEffect(schemaName)(schema, input) as Effect.Effect<A, never, never>,
  )

const encode = <A>(schemaName: string, schema: Schema.Schema<A>, input: A) =>
  Effect.runPromise(
    convertFromSchemaObjectWithEffect(schemaName)(schema, input) as Effect.Effect<A, never, never>,
  )

// ----------------------
// text
// ----------------------
describe('schemaField.text', () => {
  it('正常系: 制約なし', async () => {
    const result = await decode('text', schemaField.text(), 'hello')
    expect(result).toBe('hello')
  })

  it('異常系: maxLength超過', async () => {
    const schema = schemaField.text({ maxLength: 3 })

    await expect(decode('maxLength', schema, 'hello')).rejects.toBeTruthy()
  })

  it('異常系: minLength未満', async () => {
    const schema = schemaField.text({ minLength: 3 })

    await expect(decode('minLength', schema, 'hi')).rejects.toBeTruthy()
  })
})

// ----------------------
// optionalText
// ----------------------
describe('schemaField.optionalText', () => {
  it('正常系: null許可', async () => {
    const result = await decode('null', schemaField.optionalText(), null)
    expect(result).toBeNull()
  })

  it('正常系: string許可', async () => {
    const result = await decode('string option', schemaField.optionalText(), 'abc')
    expect(result).toBe('abc')
  })
})

// ----------------------
// int
// ----------------------
describe('schemaField.int', () => {
  it('正常系: int32', async () => {
    const result = await decode('int', schemaField.int(), 10)
    expect(result).toBe(10)
  })

  it('異常系: 小数はNG', async () => {
    await expect(decode('decimal', schemaField.int(), 1.5)).rejects.toBeTruthy()
  })

  it('異常系: max超過', async () => {
    const schema = schemaField.int({ max: 5 })

    await expect(decode('max', schema, 10)).rejects.toBeTruthy()
  })

  it('異常系: min未満', async () => {
    const schema = schemaField.int({ min: 5 })

    await expect(decode('min', schema, 1)).rejects.toBeTruthy()
  })
})

// ----------------------
// bigInt
// ----------------------
describe('schemaField.bigInt', () => {
  it('decode: string -> bigint', async () => {
    const result = await decode('bigint', schemaField.bigInt, '123')

    expect(result).toBe(123n)
  })

  it('encode: bigint -> string', async () => {
    const result = await encode('bigint', schemaField.bigInt, 123n)

    expect(result).toBe('123')
  })
})

// ----------------------
// boolean
// ----------------------
describe('schemaField.boolean', () => {
  it('正常系: boolean', async () => {
    const result = await decode('boolean', schemaField.boolean, true)

    expect(result).toBe(true)
  })

  it('異常系: stringはNG', async () => {
    await expect(decode('string ng', schemaField.boolean, 'true')).rejects.toBeTruthy()
  })
})

// ----------------------
// timestampString
// ----------------------
describe('schemaField.timestampString', () => {
  it('decode: Date -> ISO string', async () => {
    const date = new Date('2024-05-10T00:00:00.000Z')

    const result = await decode('date', schemaField.timestampString, date)

    expect(result).toBe(date.toISOString())
  })

  it('encode: string -> Date', async () => {
    const iso = '2024-05-10T00:00:00.000Z'

    const result = await encode('string->date', schemaField.timestampString, iso)

    expect(result).toEqual(new Date(iso))
  })
})

// ----------------------
// optional系
// ----------------------
describe('optional fields', () => {
  it('optionalBoolean: null OK', async () => {
    const result = await decode('optionalBoolean', schemaField.optionalBoolean, null)
    expect(result).toBeNull()
  })

  it('optionalTimestampString: null OK', async () => {
    const result = await decode(
      'optionalTimestampString',
      schemaField.optionalTimestampString,
      null,
    )
    expect(result).toBeNull()
  })
})

// ----------------------
// id (UUID)
// ----------------------
describe('schemaField.id', () => {
  it('正常系: UUID', async () => {
    const uuid = 'f8fc24ab-3ca6-45cc-bc14-e7d5e18d9d18'

    const result = await decode('uuid', schemaField.id, uuid)

    expect(result).toBe(uuid)
  })

  it('異常系: UUIDでない', async () => {
    await expect(decode('nonuuid', schemaField.id, 'abc')).rejects.toBeTruthy()
  })
})

// ----------------------
// BooleanFromString
// ----------------------
describe('BooleanFromString', () => {
  it('decode: "true" -> true', async () => {
    const result = await decode('BooleanFromString', BooleanFromString, 'true')

    expect(result).toBe(true)
  })

  it('decode: "false" -> false', async () => {
    const result = await decode('decode: "false" -> false', BooleanFromString, 'false')

    expect(result).toBe(false)
  })

  it('encode: true -> "true"', async () => {
    const result = await encode('encode: true -> "true"', BooleanFromString, true)

    expect(result).toBe('true')
  })

  it('encode: false -> "false"', async () => {
    const result = await encode('encode: false -> "false"', BooleanFromString, false)

    expect(result).toBe('false')
  })
})
