import { Schema } from 'effect'

/**
 * Defines the schema for a user identifier, branded as 'UserId'.
 */
export const UserIdSchema = Schema.String.pipe(Schema.brand('UserId'))

/**
 * Represents the static type for a branded user identifier.
 */
export type UserId = Schema.Schema.Type<typeof UserIdSchema>

/**
 * Defines the schema for a user record, containing a branded user identifier, flags for group and validity status, and an optional region.
 */
export const UserSchema = Schema.Struct({
  userId: UserIdSchema,
  isGroup: Schema.Boolean,
  isValid: Schema.Boolean,
  region: Schema.optional(Schema.String),
})

/**
 * Represents the static type for a user record.
 */
export type User = typeof UserSchema.Type

/**
 * Provides utilities for creating a branded UserId.
 *
 * @param s The string identifier to decode as a UserId.
 *
 * @returns Returns the decoded UserId.
 */
export const UserId = {
  make: (s: string) => Schema.decodeSync(UserIdSchema)(s),
}
