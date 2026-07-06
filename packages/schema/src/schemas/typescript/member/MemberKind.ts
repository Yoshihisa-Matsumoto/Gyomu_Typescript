import { Schema } from 'effect'

/**
 * Defines a schema for member kinds, restricted to 'method' or 'property' literals.
 */
export const MemberKind = Schema.Literals(['method', 'property'])

/**
 * Represents the union type of valid member kinds ('method' | 'property').
 */
export type MemberKind = Schema.Schema.Type<typeof MemberKind>
