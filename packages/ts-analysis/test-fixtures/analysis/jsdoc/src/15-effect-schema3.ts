import { Schema } from 'effect'

/**
 * Reference target
 */
export class User extends Schema.Class<User>('User')({
  id: Schema.String,
  name: Schema.String,
}) {}

/**
 * Empty struct
 */
export const EmptyStruct = Schema.Struct({})

/**
 * Primitive
 */
export const PrimitiveString = Schema.String
export const PrimitiveBoolean = Schema.Boolean
export const PrimitiveInt = Schema.Int

/**
 * Literal
 */
export const LiteralString = Schema.Literal('abc')
export const LiteralNumber = Schema.Literal(123)
export const LiteralBoolean = Schema.Literal(true)

/**
 * Struct
 */
export const SimpleStruct = Schema.Struct({
  id: Schema.String,
  age: Schema.Int,
})

/**
 * Nested Struct
 */
export const NestedStruct = Schema.Struct({
  user: User,
  child: Schema.Struct({
    name: Schema.String,
    enabled: Schema.Boolean,
  }),
})

/**
 * Array
 */
export const StringArray = Schema.Array(Schema.String)

export const ReferenceArray = Schema.Array(User)

/**
 * Union
 */
export const SimpleUnion = Schema.Union([Schema.String, Schema.Int, User])

/**
 * Empty Union
 */
export const EmptyUnion = Schema.Union([])

/**
 * Annotated
 */
export const AnnotatedString = Schema.String.annotate({
  description: 'description',
  title: 'title',
  identifier: 'identifier',
})

/**
 * Annotated Struct
 */
export const AnnotatedStruct = Schema.Struct({
  id: Schema.String,
}).annotate({
  description: 'struct description',
  title: 'struct title',
})

/**
 * Optional
 */
export const OptionalStruct = Schema.Struct({
  name: Schema.optional(Schema.String),
})

/**
 * Nested Array
 */
export const NestedArray = Schema.Array(Schema.Array(Schema.String))

/**
 * Array of Union
 */
export const ArrayUnion = Schema.Array(Schema.Union([Schema.String, Schema.Int]))

/**
 * Union of Array
 */
export const UnionArray = Schema.Union([Schema.Array(Schema.String), Schema.Array(User)])

/**
 * fieldsAssign
 */
export const Base = Schema.Struct({
  id: Schema.String,
})

export const Child = Schema.Struct({
  name: Schema.String,
}).pipe(Schema.fieldsAssign(Base.fields))
