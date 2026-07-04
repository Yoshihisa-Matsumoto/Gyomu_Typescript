import { Schema } from 'effect'

export const MemberAccessor = Schema.Literals(['private', 'protected', 'public']).annotate({
  description: 'Defines the access levels available for members.',
})

export type MemberAccessor = Schema.Schema.Type<typeof MemberAccessor>
