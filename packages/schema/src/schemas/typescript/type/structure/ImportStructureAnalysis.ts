import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents an import type.
 *
 * @example
 * ```ts
 * import("./foo").Bar
 * ```
 *
 * @example
 * ```ts
 * import("./foo")
 * ```
 *
 * @example
 * ```ts
 * import("./foo").default
 * ```
 *
 * Corresponds to TypeScript's `ImportTypeNode`.
 */
export interface ImportStructureAnalysis extends StructureBase {
  readonly kind: 'import'

  /**
   * Module specifier.
   */
  readonly moduleSpecifier: string

  /**
   * Imported qualifier.
   *
   * Undefined when referring to the module itself.
   */
  readonly qualifier: string | undefined

  /**
   * Type arguments supplied to the import type.
   */
  readonly typeArguments: ReadonlyArray<TypeAnalysis>
}

export const ImportStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('import'),

  moduleSpecifier: Schema.String.annotate({
    description: 'Module specifier.',
  }),

  qualifier: Schema.optional(Schema.String).annotate({
    description: 'Imported qualifier. Undefined when referring to the module itself.',
  }),

  typeArguments: Schema.Array(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'Type arguments supplied to the import type.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'ImportStructureAnalysis',
    title: 'ImportStructureAnalysis',
    description: 'Represents an import type.',
  }),
)
