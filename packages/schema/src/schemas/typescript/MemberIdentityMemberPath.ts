import { Schema } from 'effect'

/**
 * Represents a path of segments identifying a member, consisting of strings or numbers.
 */
export const MemberIdentityMemberPath = Schema.Array(
  Schema.Union([Schema.String, Schema.Number]),
).annotate({
  description: 'Represents a path of segments identifying a member.',
})

/**
 * The inferred type of MemberIdentityMemberPath, representing an array of member identifier segments.
 */
export type MemberIdentityMemberPath = Schema.Schema.Type<typeof MemberIdentityMemberPath>
