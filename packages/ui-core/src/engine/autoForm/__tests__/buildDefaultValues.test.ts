import { describe, expect, it } from 'vitest'
import { buildDefaultValues } from '../buildDefaultValues.js' // パスは適宜調整
import type { FormFieldMeta } from '../../../dsl/type.js'

describe('buildDefaultValues', () => {
  it('initialValuesがある場合はそれを優先する', () => {
    const fields: Array<FormFieldMeta> = [
      { name: 'age', widget: 'number', options: {} },
      { name: 'name', widget: 'text', options: {} },
    ]

    const initialValues = {
      age: 30,
      name: 'John',
    }

    const result = buildDefaultValues(fields, initialValues)

    expect(result).toEqual({
      age: 30,
      name: 'John',
    })
  })

  it('number widget は undefined になる', () => {
    const fields: Array<FormFieldMeta> = [{ name: 'age', widget: 'number', options: {} }]

    const result = buildDefaultValues(fields)

    expect(result).toEqual({
      age: undefined,
    })
  })

  it('default は空文字になる', () => {
    const fields: Array<FormFieldMeta> = [
      { name: 'name', widget: 'text', options: {} },
      { name: 'email', widget: 'text', options: {} },
    ]

    const result = buildDefaultValues(fields)

    expect(result).toEqual({
      name: '',
      email: '',
    })
  })

  it('initialValues が一部のみある場合はそれだけ上書きされる', () => {
    const fields: Array<FormFieldMeta> = [
      { name: 'age', widget: 'number', options: {} },
      { name: 'name', widget: 'text', options: {} },
    ]

    const initialValues = {
      name: 'Alice',
    }

    const result = buildDefaultValues(fields, initialValues)

    expect(result).toEqual({
      age: undefined,
      name: 'Alice',
    })
  })

  it('initialValues に未知のキーがあっても無視される', () => {
    const fields: Array<FormFieldMeta> = [{ name: 'name', widget: 'text', options: {} }]

    const initialValues = {
      name: 'Bob',
      unknown: 123,
    }

    const result = buildDefaultValues(fields, initialValues)

    expect(result).toEqual({
      name: 'Bob',
    })
  })

  it('fieldConfigs が空なら空オブジェクト', () => {
    const result = buildDefaultValues([])

    expect(result).toEqual({})
  })
})
