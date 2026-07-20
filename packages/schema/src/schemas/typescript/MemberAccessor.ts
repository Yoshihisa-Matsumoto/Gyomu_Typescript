import { Schema } from 'effect'

/**
 * Defines a schema for member access levels, including private, protected, and public.
 */
export const MemberAccessor = Schema.Literals(['private', 'protected', 'public']).annotate({
  description: 'Defines the access levels available for members.',
})

/**
 * Represents the TypeScript type inferred from the MemberAccessor schema.
 */
export type MemberAccessor = Schema.Schema.Type<typeof MemberAccessor>
