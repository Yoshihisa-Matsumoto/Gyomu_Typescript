import { Schema } from 'effect'
import { DecoratedStructureAnalysis } from './DecoratedStructureAnalysis.js'

/**
 * Represents a rest type.
 *
 * Corresponds to TypeScript's `RestTypeNode`.
 */
export type RestStructureAnalysis = typeof RestStructureAnalysis.Type

export const RestStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('rest'),
}).pipe(
  Schema.fieldsAssign(DecoratedStructureAnalysis.fields),
  Schema.annotate({
    identifier: 'RestStructureAnalysis',
    title: 'RestStructureAnalysis',
    description: 'Represents a rest type.',
  }),
)
