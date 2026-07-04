import { Schema } from 'effect'

export const MemberIdentityMemberPath = Schema.Array(
  Schema.Union([Schema.String, Schema.Number]),
).annotate({
  description: 'Represents a path of segments identifying a member.',
})

export type MemberIdentityMemberPath = Schema.Schema.Type<typeof MemberIdentityMemberPath>
