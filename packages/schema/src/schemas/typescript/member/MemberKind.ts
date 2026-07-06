import { Schema } from 'effect'

export const MemberKind = Schema.Literals(['method', 'property'])

export type MemberKind = Schema.Schema.Type<typeof MemberKind>
