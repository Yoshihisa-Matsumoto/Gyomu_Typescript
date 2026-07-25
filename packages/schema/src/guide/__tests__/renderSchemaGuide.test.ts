import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { renderSchemaGuide } from '../renderSchemaGuide.js'
import { logger } from '../../gyomu/logger/Logger.js'
import { NonDocumentableTypeProperty } from '../../schemas/typescript/index.js'
import { PackageConceptSchema } from '../../schemas/concept/PackageConcept.js'

describe(`renderSchemaGuide`, () => {
  describe(`primitive`, () => {
    it(`Any`, () => {
      let result = renderSchemaGuide(Schema.Any)

      expect(result).toBe(`any`)
      result = renderSchemaGuide(Schema.Any.annotate({ description: `comment` }))
      expect(result).toBe(`
# comment
any`)
    })
    it(`BigInt`, () => {
      const result = renderSchemaGuide(Schema.BigInt)

      expect(result).toBe(`bigint`)
      const result2 = renderSchemaGuide(Schema.BigInt.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
bigint`)
    })
    it(`Boolean`, () => {
      const result = renderSchemaGuide(Schema.Boolean)

      expect(result).toBe(`boolean`)
      const result2 = renderSchemaGuide(Schema.Boolean.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
boolean`)
    })
    it(`Never`, () => {
      const result = renderSchemaGuide(Schema.Never)

      expect(result).toBe(`never`)
      const result2 = renderSchemaGuide(Schema.Never.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
never`)
    })
    it(`Null`, () => {
      const result = renderSchemaGuide(Schema.Null, { logger: logger })

      expect(result).toBe(`null`)
      const result2 = renderSchemaGuide(Schema.Null.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
null`)
    })
    it(`Number`, () => {
      const result = renderSchemaGuide(Schema.Number)

      expect(result).toBe(`number`)
      const result2 = renderSchemaGuide(Schema.Number.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
number`)
    })
    it(`String`, () => {
      const result = renderSchemaGuide(Schema.String)

      expect(result).toBe(`string`)
      const result2 = renderSchemaGuide(Schema.String.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
string`)
    })
    it(`Undefined`, () => {
      const result = renderSchemaGuide(Schema.Undefined)

      expect(result).toBe(`undefined`)
      const result2 = renderSchemaGuide(Schema.Undefined.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
undefined`)
    })
    it(`Unknown`, () => {
      const result = renderSchemaGuide(Schema.Unknown)

      expect(result).toBe(`unknown`)
      const result2 = renderSchemaGuide(Schema.Unknown.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
unknown`)
    })
    it(`Void`, () => {
      const result = renderSchemaGuide(Schema.Void)

      expect(result).toBe(`void`)
      const result2 = renderSchemaGuide(Schema.Void.annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
void`)
    })
  })

  describe(`Literal`, () => {
    it(`string`, () => {
      const result = renderSchemaGuide(Schema.Literal(`abc`))

      expect(result).toBe(`"abc"`)
      const result2 = renderSchemaGuide(Schema.Literal(`abc`).annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
"abc"`)
    })
    it(`number`, () => {
      const result = renderSchemaGuide(Schema.Literal(123))

      expect(result).toBe(`123`)
      const result2 = renderSchemaGuide(Schema.Literal(123).annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
123`)
    })
    it(`bigint`, () => {
      const result = renderSchemaGuide(Schema.Literal(123n))

      expect(result).toBe(`123`)
      const result2 = renderSchemaGuide(Schema.Literal(123n).annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
123`)
    })
    it(`boolean`, () => {
      const result = renderSchemaGuide(Schema.Literal(false))

      expect(result).toBe(`false`)
      const result2 = renderSchemaGuide(Schema.Literal(false).annotate({ description: `comment` }))
      expect(result2).toBe(`
# comment
false`)
    })
  })

  describe(`Enum`, () => {
    it(`enum`, () => {
      enum Fruits {
        Apple,
        Banana,
      }

      //      ┌─── Enums<typeof Fruits>
      //      ▼
      const schema = Schema.Enum(Fruits)

      const result = renderSchemaGuide(schema)

      expect(result).toBe(`Apple | Banana`)

      const schema2 = Schema.Enum(Fruits).annotate({ description: `Comment` })
      const result2 = renderSchemaGuide(schema2)

      expect(result2).toBe(`
# Comment
Apple | Banana`)
    })
  })

  describe(`Array`, () => {
    it(`simple`, () => {
      const result = renderSchemaGuide(Schema.Array(Schema.String))

      expect(result).toBe(`- string`)

      const result2 = renderSchemaGuide(
        Schema.Array(Schema.String.annotate({ description: `Comment2` })).annotate({
          description: `Comment1`,
        }),
      )

      expect(result2).toBe(`
# Comment1
- 
  # Comment2
  string`)

      const result3 = renderSchemaGuide(
        Schema.Array(Schema.String).annotate({
          description: `Comment1`,
        }),
      )
      expect(result3).toBe(`
# Comment1
- string`)
    })
  })

  describe(`Union`, () => {
    it(`simple`, () => {
      const result = renderSchemaGuide(Schema.Union([Schema.String, Schema.Number]))

      expect(result).toBe(`string | number`)
    })
  })

  describe(`Composite`, () => {
    it(`simple`, () => {
      const User = Schema.Struct({
        id: Schema.String,
        name: Schema.String,
        age: Schema.optional(Schema.Number).annotate({ description: 'Age' }),
      }).annotate({ description: `User` })
      const result = renderSchemaGuide(User)

      expect(result).toBe(`
# User

  id:string

  name:string

  age?:
    # Age
    number | undefined
`)
    })
  })

  describe(`Real World`, () => {
    it(`NonDocumentableTypeProperty`, () => {
      const result = renderSchemaGuide(NonDocumentableTypeProperty)
      expect(result).toMatchSnapshot()
    })
    it(`PackageConcept`, () => {
      const result = renderSchemaGuide(PackageConceptSchema)
      expect(result).toMatchSnapshot()
    })
  })
})
