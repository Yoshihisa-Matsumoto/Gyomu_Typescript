import { Schema } from 'effect'
import { DecoratedStructureAnalysis } from './DecoratedStructureAnalysis.js'

/**
 * Represents a optional type.
 *
 * Corresponds to TypeScript's `OptionalTypeNode`.
 */
export type OptionalStructureAnalysis = typeof OptionalStructureAnalysis.Type

export const OptionalStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('optional'),
}).pipe(
  Schema.fieldsAssign(DecoratedStructureAnalysis.fields),
  Schema.annotate({
    identifier: 'OptionalStructureAnalysis',
    title: 'OptionalStructureAnalysis',
    description: 'Represents a optional type.',
  }),
)
