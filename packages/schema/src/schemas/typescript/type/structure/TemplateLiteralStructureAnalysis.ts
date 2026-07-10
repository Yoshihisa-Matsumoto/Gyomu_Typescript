import { Schema } from 'effect'
import { TypeAnalysis } from '../TypeAnalysis.js'
import { StructureBase } from './StructureBase.js'

/**
 * Represents a template literal type.
 *
 * @example
 * ```ts
 * `get${Capitalize<K>}`
 * ```
 *
 * @example
 * ```ts
 * `${Prefix}_${Suffix}`
 * ```
 *
 * Corresponds to TypeScript's `TemplateLiteralTypeNode`.
 */
export interface TemplateLiteralStructureAnalysis extends StructureBase {
  readonly kind: 'templateLiteral'

  /**
   * Template literal spans in order.
   *
   * The array alternates between literal text and embedded types, always
   * beginning and ending with a literal segment (which may be empty).
   */
  readonly spans: ReadonlyArray<string | TypeAnalysis>
}

export const TemplateLiteralStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('templateLiteral'),

  spans: Schema.Array(Schema.Union([Schema.String, Schema.suspend(() => TypeAnalysis)])).annotate({
    description:
      'Template literal spans in order, alternating between literal text and embedded types.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'TemplateLiteralStructureAnalysis',
    title: 'TemplateLiteralStructureAnalysis',
    description: 'Represents a template literal type.',
  }),
)
