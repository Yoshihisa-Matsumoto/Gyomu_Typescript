import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents a conditional type.
 *
 * @example
 * ```ts
 * T extends U ? X : Y
 * ```
 *
 * @example
 * ```ts
 * type Flatten<T> = T extends readonly (infer U)[]
 *   ? U
 *   : T
 * ```
 *
 * Corresponds to TypeScript's `ConditionalTypeNode`.
 */
export interface ConditionalStructureAnalysis extends StructureBase {
  readonly kind: 'conditional'

  /**
   * Type being tested.
   */
  readonly checkType: TypeAnalysis

  /**
   * Type against which the check is performed.
   */
  readonly extendsType: TypeAnalysis

  /**
   * Result type when the condition is satisfied.
   */
  readonly trueType: TypeAnalysis

  /**
   * Result type when the condition is not satisfied.
   */
  readonly falseType: TypeAnalysis
}

export const ConditionalStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('conditional'),

  checkType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type being tested.',
  }),

  extendsType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type against which the check is performed.',
  }),

  trueType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Result type when the condition is satisfied.',
  }),

  falseType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Result type when the condition is not satisfied.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'ConditionalStructureAnalysis',
    title: 'ConditionalStructureAnalysis',
    description: 'Represents a conditional type.',
  }),
)
