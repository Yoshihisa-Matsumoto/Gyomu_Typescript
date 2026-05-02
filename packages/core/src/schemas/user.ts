import { Schema } from 'effect';

export const UserSchema = Schema.Struct({
  userId: Schema.String,
  isGroup: Schema.Boolean,
  isValid: Schema.Boolean,
  region: Schema.optional(Schema.String),
});

export type User = typeof UserSchema.Type;
