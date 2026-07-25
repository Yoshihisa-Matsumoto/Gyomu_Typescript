import { describe, expect, it } from 'vitest'
import { Schema } from 'effect'
import { normalizeSchema } from '../normalizeSchema.js'
import { logger } from '../../gyomu/logger/Logger.js'

describe('normalizeSchema', () => {
  describe('primitive', () => {
    it('Any', () => {
      const result = normalizeSchema(Schema.Any)

      expect(result).toMatchObject({
        kind: 'any',
        attributes: {},
      })
    })
    it('BigInt', () => {
      const result = normalizeSchema(Schema.BigInt)

      expect(result).toMatchObject({
        kind: 'bigint',
        attributes: {},
      })
    })
    it('Boolean', () => {
      const result = normalizeSchema(Schema.Boolean)

      expect(result).toMatchObject({
        kind: 'boolean',
        attributes: {},
      })
    })
    it('Never', () => {
      const result = normalizeSchema(Schema.Never)

      expect(result).toMatchObject({
        kind: 'never',
        attributes: {},
      })
    })
    it('Null', () => {
      const result = normalizeSchema(Schema.Null, { logger: logger })

      expect(result).toMatchObject({
        kind: 'null',
        attributes: {},
      })
    })
    it('Number', () => {
      const result = normalizeSchema(Schema.Number)

      expect(result).toMatchObject({
        kind: 'number',
        attributes: {},
      })
    })
    it('String', () => {
      const result = normalizeSchema(Schema.String)

      expect(result).toMatchObject({
        kind: 'string',
        attributes: {},
      })
    })
    it('Undefined', () => {
      const result = normalizeSchema(Schema.Undefined)

      expect(result).toMatchObject({
        kind: 'undefined',
        attributes: {},
      })
    })
    it('Unknown', () => {
      const result = normalizeSchema(Schema.Unknown)

      expect(result).toMatchObject({
        kind: 'unknown',
        attributes: {},
      })
    })
    it('Void', () => {
      const result = normalizeSchema(Schema.Void)

      expect(result).toMatchObject({
        kind: 'void',
        attributes: {},
      })
    })
  })
  describe('Annotation', () => {
    it('description', () => {
      const result = normalizeSchema(Schema.String.annotate({ description: 'User name' }))

      expect(result).toMatchObject({
        kind: 'string',
        description: 'User name',
      })
    })
  })
  describe('Literal', () => {
    it('string', () => {
      const result = normalizeSchema(Schema.Literal('abc'))

      expect(result).toMatchObject({
        kind: 'literal',
        value: 'abc',
      })
    })
    it('number', () => {
      const result = normalizeSchema(Schema.Literal(123))

      expect(result).toMatchObject({
        kind: 'literal',
        value: 123,
      })
    })
    it('boolean', () => {
      const result = normalizeSchema(Schema.Literal(false))

      expect(result).toMatchObject({
        kind: 'literal',
        value: false,
      })
    })
  })

  describe('Enum', () => {
    it('enum', () => {
      enum Fruits {
        Apple,
        Banana,
      }

      //      ┌─── Enums<typeof Fruits>
      //      ▼
      const schema = Schema.Enum(Fruits)

      const result = normalizeSchema(schema)

      expect(result).toMatchObject({
        kind: 'enum',
        values: [
          ['Apple', 0],
          ['Banana', 1],
        ],
      })
    })
  })

  describe('Array', () => {
    it('simple', () => {
      const result = normalizeSchema(Schema.Array(Schema.String))

      expect(result).toMatchObject({
        kind: 'array',
        elementType: {
          kind: 'string',
        },
      })
    })
  })

  describe('Union', () => {
    it('simple', () => {
      const result = normalizeSchema(Schema.Union([Schema.String, Schema.Number]))

      expect(result).toMatchObject({
        kind: 'union',
        types: [{ kind: 'string' }, { kind: 'number' }],
      })
    })
  })
  describe('Composite', () => {
    it('simple', () => {
      const User = Schema.Struct({
        id: Schema.String,
        name: Schema.String,
        age: Schema.optional(Schema.Number),
      }).annotate({ description: 'User' })
      const result = normalizeSchema(User)
      console.dir(result, { depth: null })
      expect(result).toMatchObject({
        kind: 'object',
        description: 'User',
        properties: [
          { name: 'id', node: { kind: 'string' } },
          { name: 'name', node: { kind: 'string' } },
          {
            name: 'age',
            node: {
              kind: 'union',
              optional: true,
              types: [{ kind: 'number' }, { kind: 'undefined' }],
            },
          },
        ],
      })
    })
  })

  describe('Suspend', () => {
    it('suspend', () => {
      const result = normalizeSchema(Schema.suspend(() => Schema.String))

      expect(result).toMatchObject({
        kind: 'string',
      })
    })
  })
  describe('recursive schema', () => {
    it('returns recursive node when the same AST is visited twice', () => {
      const Node: Schema.Schema<any> = Schema.Struct({
        next: Schema.optional(Schema.suspend(() => Node)),
      })

      const result = normalizeSchema(Node)
      console.dir(result, { depth: null })
      expect(result).toMatchObject({
        kind: 'object',
        attributes: {},
        optional: undefined,
        description: undefined,
        properties: [
          {
            name: 'next',
            node: {
              kind: 'union',
              types: [
                {
                  kind: 'recursive',
                },
                {
                  kind: 'undefined',
                },
              ],
            },
          },
        ],
      })
    })
  })

  describe('maxDepth', () => {
    it('stops traversal when maxDepth is reached', () => {
      const schema = Schema.Array(Schema.Array(Schema.Array(Schema.String)))

      const result = normalizeSchema(schema, {
        maxDepth: 2,
      })

      expect(result).toEqual({
        kind: 'array',
        attributes: {},
        description: undefined,
        optional: undefined,
        elementType: {
          kind: 'array',
          attributes: {},
          description: undefined,
          optional: undefined,
          elementType: {
            kind: 'recursive',
            attributes: {},
            description: undefined,
            optional: undefined,
          },
        },
      })
    })
  })
})
