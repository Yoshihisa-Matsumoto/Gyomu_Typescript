import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { analyzeAnnotationChecks } from '../analyzeAnnotationChecks.js'

describe('analyzeAnnotationChecks', () => {
  describe('string', () => {
    it('extracts minLength and maxLength', () => {
      const schema = Schema.String.check(Schema.isMaxLength(10), Schema.isMinLength(2))
      console.dir(schema, { depth: null })
      expect(analyzeAnnotationChecks(schema.ast._tag, schema.ast.checks!)).toMatchObject({
        'string-minLength': 2,
        'string-maxLength': 10,
      })
    })

    it('extracts pattern', () => {
      const schema = Schema.String.check(Schema.isPattern(/^[A-Z]+$/))

      const attributes = analyzeAnnotationChecks(schema.ast._tag, schema.ast.checks!)

      expect(attributes['string-patterns']).toBeDefined()
    })
  })

  describe('number', () => {
    it('extracts min/max', () => {
      const schema = Schema.Number.check(
        Schema.isGreaterThanOrEqualTo(0),
        Schema.isLessThanOrEqualTo(100),
      )
      console.dir(schema, { depth: null })
      expect(analyzeAnnotationChecks(schema.ast._tag, schema.ast.checks!)).toMatchObject({
        'number-min': 0,
        'number-max': 100,
      })
    })

    it('extracts integer', () => {
      const schema = Schema.Int

      expect(analyzeAnnotationChecks(schema.ast._tag, schema.ast.checks!)).toMatchObject({
        'number-isInteger': true,
      })
    })
  })

  describe('array constraints', () => {
    it('extracts length constraints', () => {
      const schema = Schema.Array(Schema.String).check(Schema.isMinLength(1), Schema.isMaxLength(5))

      expect(analyzeAnnotationChecks(schema.ast._tag, schema.ast.checks!)).toMatchObject({
        'arrays-minLength': 1,
        'arrays-maxLength': 5,
      })
    })
  })

  describe('bigint constraints', () => {
    it('extracts min/max', () => {
      const schema = Schema.BigInt.check(
        Schema.isGreaterThanOrEqualToBigInt(0n),
        Schema.isLessThanOrEqualToBigInt(100n),
      )
      console.dir(schema, { depth: null })
      expect(analyzeAnnotationChecks(schema.ast._tag, schema.ast.checks!)).toMatchObject({
        'bigint-min': 0n,
        'bigint-max': 100n,
      })
    })
  })

  describe('date constraints', () => {
    it('extracts noInvalidDate', () => {
      const attributes = analyzeAnnotationChecks('date', Schema.DateValid.ast.checks!)

      expect(attributes).toMatchObject({
        'date-valid': true,
      })
    })
  })

  describe('multiple checks', () => {
    it('merges all constraints', () => {
      const schema = Schema.String.check(
        Schema.isMinLength(2),
        Schema.isMaxLength(10),
        Schema.isPattern(/abc/),
      )

      const attributes = analyzeAnnotationChecks(schema.ast._tag, schema.ast.checks!)

      expect(attributes).toMatchObject({
        'string-minLength': 2,
        'string-maxLength': 10,
      })

      expect(attributes['string-patterns']).toBeDefined()
    })
  })

  // describe('empty', () => {
  //   it('returns empty object', () => {
  //     expect(analyzeAnnotationChecks('', [])).toEqual({})
  //   })
  // })
})
