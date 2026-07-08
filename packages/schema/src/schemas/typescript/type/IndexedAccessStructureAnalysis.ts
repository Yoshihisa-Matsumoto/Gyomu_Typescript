import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents an indexed access type.
 *
 * @example
 * ```ts
 * T[K]
 * ```
 *
 * @example
 * ```ts
 * Schema.Type<Select>
 * ```
 *
 * Corresponds to TypeScript's `IndexedAccessTypeNode`.
 */
export interface IndexedAccessStructureAnalysis extends StructureBase {
  readonly kind: 'indexedAccess'

  /**
   * Type being indexed.
   *
   * @example
   * `T[K]` → `T`
   */
  readonly objectType: TypeAnalysis

  /**
   * Type used as the index.
   *
   * @example
   * `T[K]` → `K`
   */
  readonly indexType: TypeAnalysis
}

export const IndexedAccessStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('indexedAccess'),

  objectType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type being indexed.',
  }),

  indexType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Type used as the index.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'IndexedAccessStructureAnalysis',
    title: 'IndexedAccessStructureAnalysis',
    description: 'Represents an indexed access type.',
  }),
)
