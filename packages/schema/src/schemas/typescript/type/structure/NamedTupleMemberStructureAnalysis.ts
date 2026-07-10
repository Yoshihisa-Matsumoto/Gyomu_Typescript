import { Schema } from 'effect'
import { DecoratedStructureAnalysis } from './DecoratedStructureAnalysis.js'

/**
 * Represents a NamedTupleMember type.
 *
 * Corresponds to TypeScript's `NamedTupleMemberTypeNode`.
 */
export type NamedTupleMemberStructureAnalysis = typeof NamedTupleMemberStructureAnalysis.Type

export const NamedTupleMemberStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('namedTupleMember'),
  name: Schema.String.annotate({ description: 'Member Label' }),
  optional: Schema.Boolean.annotate({ description: 'Whether the property is optional.' }),
}).pipe(
  Schema.fieldsAssign(DecoratedStructureAnalysis.fields),
  Schema.annotate({
    identifier: 'NamedTupleMemberStructureAnalysis',
    title: 'NamedTupleMemberStructureAnalysis',
    description: 'Represents a NamedTupleMember type.',
  }),
)
