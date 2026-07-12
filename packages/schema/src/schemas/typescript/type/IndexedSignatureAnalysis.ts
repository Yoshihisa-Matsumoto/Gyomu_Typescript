import { Schema } from 'effect'
import { SymbolIdentity } from '../SymbolIdentity.js'
import { LineRange } from '../LineRange.js'
import { ParsedJsDoc } from '../jsdoc/ParsedJsDoc.js'
import { JsDocAnalysis } from '../jsdoc/JsDocAnalysis.js'
import { TypeAnalysis } from './TypeAnalysis.js'
import type { SymbolId } from '../../../typescript/types.js'

/**
 * Represents an index signature.
 *
 * @example
 * ```ts
 * [key: string]&#58; number
 * ```
 *
 * @example
 * ```ts
 * readonly [id: number]: User
 * ```
 */
export interface IndexSignatureAnalysis {
  readonly id: SymbolId

  readonly identity: SymbolIdentity

  readonly kind: 'indexed-signature'
  /**
   * Parameter name.
   */
  readonly parameterName: string

  /**
   * Parameter type.
   */
  readonly parameterType: TypeAnalysis

  /**
   * Value type.
   */
  readonly type: TypeAnalysis

  /**
   * Whether the index signature is readonly.
   */
  readonly readonly: boolean

  /**
   * Declaration order of the property.
   */
  readonly declarationOrder: number

  /**
   * Indicates that this member is documentable.
   */
  readonly documentable: true

  /**
   * Contains the structured JSDoc analysis.
   */
  readonly jsDoc: JsDocAnalysis | undefined

  /**
   * A collection of parsed JSDoc/TSDoc elements.
   */
  readonly parsedJsDoc: ReadonlyArray<ParsedJsDoc> | undefined

  /**
   * The location information of the symbol within the source code.
   */
  readonly location: LineRange

  /**
   * The character offset where the symbol starts.
   */
  readonly startOffset: number

  /**
   * Leading whitespace of the declaration line, used when generating or updating JSDoc/TSDoc comments.
   */
  readonly docIndent: string
}
type aa = Schema.Schema.Type<typeof IndexSignatureAnalysis>
export const IndexSignatureAnalysis = Schema.Struct({
  /**
   * Stable identifier of the symbol.
   *
   * @remarks
   * This identifier must remain stable across repeated analyses of the same source code.
   * It is used as a correlation key for generated documentation, merge operations,
   * snapshots, and other analysis artifacts.
   *
   * Recommended format:
   *
   * ```text
   * <relative-file-path>::<qualified-symbol-name>
   * ```
   *
   * Example:
   *
   * ```text
   * src/user/UserService.ts::UserService.getUser
   * ```
   */
  id: Schema.String.pipe(Schema.brand('SymbolId')).annotate({
    description:
      'Stable identifier of the symbol.\n\n' +
      'This identifier must remain stable across repeated analyses of the same source code. ' +
      'It is used as a correlation key for generated documentation, merge operations, ' +
      'snapshots, and other analysis artifacts.\n\n' +
      'Recommended format:\n' +
      '<relative-file-path>::<qualified-symbol-name>\n\n' +
      'Example:\n' +
      'src/user/UserService.ts::UserService.getUser',
  }),

  /**
   * Symbol name/identity details.
   */
  identity: SymbolIdentity.annotate({
    description: 'Symbol name/identity details.',
  }),

  kind: Schema.Literal('indexed-signature'),

  parameterName: Schema.String.annotate({
    description: 'Parameter name.',
  }),

  parameterType: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Parameter type.',
  }),

  type: Schema.suspend(() => TypeAnalysis).annotate({
    description: 'Value type.',
  }),

  readonly: Schema.Boolean.annotate({
    description: 'Whether the index signature is readonly.',
  }),

  declarationOrder: Schema.Number.annotate({
    description: 'Declaration order of the property.',
  }),

  /**
   * Indicates that this member is documentable.
   */
  documentable: Schema.Literal(true).annotate({
    description: 'Indicates that this member is documentable.',
  }),

  /**
   * Contains the structured JSDoc analysis.
   */
  jsDoc: Schema.Union([JsDocAnalysis, Schema.Undefined]).annotate({
    description: 'Contains the structured JSDoc analysis.',
  }),

  /**
   * A collection of parsed JSDoc/TSDoc elements.
   */
  parsedJsDoc: Schema.Union([Schema.Array(ParsedJsDoc), Schema.Undefined]).annotate({
    description: 'A collection of parsed JSDoc/TSDoc elements.',
  }),

  /**
   * The location information of the symbol within the source code.
   */
  location: LineRange.annotate({
    description: 'The location information of the symbol within the source code.',
  }),

  /**
   * The character offset where the symbol starts.
   */
  startOffset: Schema.Number.annotate({
    description: 'The character offset where the symbol starts.',
  }),

  /**
   * Leading whitespace of the declaration line, used when generating or updating JSDoc/TSDoc comments.
   */
  docIndent: Schema.String.annotate({
    description:
      'Leading whitespace of the declaration line, used when generating or updating JSDoc/TSDoc comments.',
  }),
}).annotate({
  identifier: 'IndexSignatureAnalysis',
  title: 'IndexSignatureAnalysis',
  description: 'Represents an index signature.',
})
