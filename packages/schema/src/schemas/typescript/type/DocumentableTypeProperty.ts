import { Schema } from 'effect'
import { JsDocAnalysis } from '../jsdoc/JsDocAnalysis.js'
import { ParsedJsDoc } from '../jsdoc/ParsedJsDoc.js'
import { LineRange } from '../LineRange.js'
import { TypePropertyBase } from './TypePropertyBase.js'

/**
 * Represents a documentable type property.
 */
export const DocumentableTypeProperty = Schema.Struct({
  /**
   * Indicates that this member is documentable.
   */
  documentable: Schema.Literal(true).annotate({
    description: 'Indicates that this member is documentable.',
  }),

  /**
   * Contains the structured JSDoc analysis.
   */
  jsDoc: Schema.optional(Schema.Union([JsDocAnalysis, Schema.Undefined])).annotate({
    description: 'Contains the structured JSDoc analysis.',
  }),

  /**
   * A collection of parsed JSDoc/TSDoc elements.
   */
  parsedJsDoc: Schema.optional(
    Schema.Union([Schema.Array(ParsedJsDoc), Schema.Undefined]),
  ).annotate({
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
})
  .pipe(Schema.fieldsAssign(TypePropertyBase.fields))
  .annotate({
    description: 'Represents a documentable type property.',
  })

/**
 * Represents the inferred type of a documentable type property.
 */
export type DocumentableTypeProperty = typeof DocumentableTypeProperty.Type
