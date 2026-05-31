import { Schema } from 'effect'

export const UserIdSchema = Schema.String.pipe(Schema.brand('UserId'))

export type UserId = Schema.Schema.Type<typeof UserIdSchema>

export const UserSchema = Schema.Struct({
  userId: UserIdSchema,
  isGroup: Schema.Boolean,
  isValid: Schema.Boolean,
  region: Schema.optional(Schema.String),
})

export type User = typeof UserSchema.Type

export const UserId = {
  make: (s: string) => Schema.decodeSync(UserIdSchema)(s),
}
