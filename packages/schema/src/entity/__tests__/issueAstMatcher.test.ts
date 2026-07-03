import { describe, expect, it } from 'vitest'
import { Schema } from 'effect'
import { makeFormatterStandardSchemaV1 } from 'effect/SchemaIssue'
import { defineEntityCrudSchemas } from '../defineEntityCrudSchemas.js'
import { schemaField } from '../fields.js'
import { resolveFieldErrorsFromIssue } from '../issueAstMatcher.js'
import type { SchemaIssue } from 'effect'

describe('IssueMap', () => {
  it('test', () => {
    const schemaMock = Schema.Struct({
      age: Schema.Number.check(Schema.isLessThanOrEqualTo(100), Schema.isGreaterThanOrEqualTo(0)),
      name: Schema.String.check(Schema.isMaxLength(10), Schema.isMinLength(3)),
      id: Schema.String.check(Schema.isUUID(7)),
    })

    try {
      Schema.decodeUnknownSync(schemaMock)(
        {
          age: 10234,
          name: 34,
          id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5',
        },
        { errors: 'all' },
      )
      console.log('test Exception')
    } catch (e) {
      const issue: SchemaIssue.Issue = e as any

      const formatter = makeFormatterStandardSchemaV1()
      console.log(JSON.stringify(issue, null, 2))
      console.log(JSON.stringify(formatter(issue), null, 2))
      // console.log(JSON.stringify(redact(issue)))
    }
  })
})

describe('resolveFieldErrorsFromIssue', () => {
  const schema = defineEntityCrudSchemas({
    fields: {
      userId: schemaField.int(),
      age: schemaField.int({ min: 0, max: 99 }),
      name: schemaField.text({ maxLength: 10, minLength: 3 }),
    },
    options: {},
    tags: { entity: 'test' },
  })

  it('should map simple validation errors to fields', () => {
    let issue
    try {
      Schema.decodeUnknownSync(schema.selectSchema)(
        {
          age: 200,
          name: 'a',
        },
        { errors: 'all' },
      )
    } catch (e: any) {
      issue = e.issue
    }

    const result = resolveFieldErrorsFromIssue(schema.selectSchema, issue)

    // フィールドが存在すること
    expect(result.get('age')).toBeDefined()
    expect(result.get('name')).toBeDefined()

    // エラー件数
    expect(result.get('age')!.length).toBe(1)
    expect(result.get('name')!.length).toBeGreaterThanOrEqual(1)

    // メッセージの中身（ゆるくチェック）
    expect(result.get('age')![0]).toContain('99') // max制約
    expect(result.get('name')!.join(' ')).toMatch(/3|length/i)
  })

  it('should handle missing required fields', () => {
    let issue
    try {
      Schema.decodeUnknownSync(schema.selectSchema)({
        age: 20,
      })
    } catch (e: any) {
      issue = e.issue
    }

    const result = resolveFieldErrorsFromIssue(schema.selectSchema, issue)

    // id or name が missing のはず（定義による）
    const allMessages = Array.from(result.values()).flat().join(' ')

    expect(allMessages).toMatch(/missing|required/i)
  })

  // it('should ignore unknown paths', () => {
  //   // 手動でpath無しIssue相当をシミュレート
  //   const fakeIssue = {
  //     _tag: 'InvalidValue',
  //   } as any;

  //   const result = resolveFieldErrorsFromIssue(schema.selectSchema, fakeIssue);

  //   expect(result).toEqual({});
  // });

  it('should aggregate multiple errors per field', () => {
    let issue
    try {
      Schema.decodeUnknownSync(schema.selectSchema)(
        {
          age: 999,
          name: '',
        },
        { errors: 'all' },
      )
    } catch (e: any) {
      issue = e.issue
    }

    const result = resolveFieldErrorsFromIssue(schema.selectSchema, issue)
    // console.log(JSON.stringify(result));
    // nameは minLength + maxLength（または少なくとも1つ）
    expect(result.get('name')!.length).toBeGreaterThanOrEqual(1)
  })

  it('should return empty object for valid input', () => {
    const data = {
      userId: 1,
      age: 20,
      name: 'valid',
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
    }

    const decoded = Schema.decodeUnknownExit(schema.selectSchema)(data)
    console.log(JSON.stringify(decoded, null, 2))
    expect(decoded._tag).toBe('Success')
    if (decoded._tag == 'Success') {
      const result = resolveFieldErrorsFromIssue(schema.selectSchema, {} as any)
      expect(result).toEqual(new Map()) // エラー無しなので空のMapが返るはず
    }
  })
})
