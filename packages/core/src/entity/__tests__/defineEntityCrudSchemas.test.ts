import { describe, expect, it } from 'vitest'
import { Schema } from 'effect'
import { defineEntityCrudSchemas } from '../defineEntityCrudSchemas.js'

// // ダミー（必要に応じて import に置き換え）
// const PrimaryFields = {
//   id: Schema.String,
// };

// const AuditFields = {
//   modifiedAt: Schema.Date,
//   modifiedBy: Schema.String,
// };

describe('defineEntityCrudSchemas', () => {
  it('should map keys correctly with keyMapping', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        userId: Schema.Number,
      },
      options: {
        keyMapping: {
          userId: 'user_id',
        },
      },
      tags: { entity: 'test' },
    })

    const encoded = Schema.encodeSync(schema.selectSchema)({
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
      userId: 123,
    })

    expect(encoded).toEqual({
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
      user_id: 123,
    })
  })

  it('should NOT map keys when keyMapping is empty', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        userId: Schema.Number,
      },
      tags: { entity: 'test' },
    })

    const encoded = Schema.encodeSync(schema.selectSchema)({
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
      userId: 123,
    })

    expect(encoded).toEqual({
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
      userId: 123,
    })
  })

  it('should include audit fields when includeAudit = true', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        userId: Schema.Number,
      },
      options: {
        includeAudit: true,
        keyMapping: {
          userId: 'user_id',
        },
      },
      tags: { entity: 'test' },
    })

    const encoded = Schema.encodeSync(schema.selectSchema)({
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
      userId: 1,
      modifiedAt: '2020-01-01',
      modifiedBy: 'me',
    })

    expect(encoded).toHaveProperty('modified_at')
    expect(encoded).toHaveProperty('modified_by')
    expect(encoded).toHaveProperty('user_id', 1)
  })

  it('should NOT include audit fields when includeAudit = false', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        userId: Schema.Number,
      },
      tags: { entity: 'test' },
    })

    expect(schema.includeAuditFields).toBe(false)
  })

  it('should generate correct updatefieldNames', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        a: Schema.Number,
        b: Schema.String,
      },
      tags: { entity: 'test' },
    })

    expect(schema.updatefieldNames.sort()).toEqual(['a', 'b'])
  })

  it('updateSchema should allow partial updates (optional fields)', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        a: Schema.Number,
        b: Schema.String,
      },
      tags: { entity: 'test' },
    })

    // a, b を渡さなくてもOKなはず
    const encoded = Schema.encodeSync(schema.updateSchema)({
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
    })

    expect(encoded).toEqual({
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
    })
  })

  it('insertSchema should require all fields', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        a: Schema.Number,
      },
      tags: { entity: 'test' },
    })

    expect(() =>
      Schema.encodeSync(schema.insertSchema)({
        id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
      } as any),
    ).toThrow()
  })

  it('selectSchema should decode back to original shape (round-trip)', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        userId: Schema.Number,
      },
      options: {
        keyMapping: {
          userId: 'user_id',
        },
      },
      tags: { entity: 'test' },
    })

    const input = {
      id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
      userId: 42,
    }

    const encoded = Schema.encodeSync(schema.selectSchema)(input)
    const decoded = Schema.decodeSync(schema.selectSchema)(encoded)

    expect(decoded).toEqual(input)
  })
  it('should fail if unknown key is passed', () => {
    const schema = defineEntityCrudSchemas({
      fields: {
        a: Schema.Number,
      },
      tags: { entity: 'test' },
    })

    expect(() =>
      Schema.encodeSync(schema.selectSchema)({
        id: 'abc',
        a: 1,
        unknown: 999,
      } as any),
    ).toThrow()
  })
})
