import { Schema } from 'effect'
import { SymbolIdentity } from '../SymbolIdentity.js'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Common properties shared by all type properties.
 */
export const TypePropertyBase = Schema.Struct({
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

  name: Schema.String.annotate({
    description: 'The name of the property.',
  }),

  type: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]).annotate({
    description: 'The type of the property.',
  }),

  optional: Schema.Boolean.annotate({
    description: 'Whether the property is optional.',
  }),

  readonly: Schema.Boolean.annotate({
    description: 'Whether the property is readonly.',
  }),

  rest: Schema.Boolean.annotate({
    description: 'Whether the property is a rest parameter.',
  }),

  declarationOrder: Schema.Number.annotate({
    description: 'Declaration order of the property.',
  }),
}).annotate({
  description: 'Common properties shared by all type properties.',
})

/**
 * TypeScript type representation for the properties shared by all type properties.
 */
export type TypePropertyBase = typeof TypePropertyBase.Type
