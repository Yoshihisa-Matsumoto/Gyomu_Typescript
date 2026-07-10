import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

export interface DecoratedStructureAnalysis extends StructureBase {
  /**
   * Type decorated.
   */
  readonly type: TypeAnalysis
}

export const DecoratedStructureAnalysis = Schema.Struct({
  type: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type decorated',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'ParenthesizedStructureAnalysis',
    title: 'ParenthesizedStructureAnalysis',
    description: 'Represents a parenthesized type.',
  }),
)
