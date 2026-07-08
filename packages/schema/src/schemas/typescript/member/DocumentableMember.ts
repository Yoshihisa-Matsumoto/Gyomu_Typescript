import { Schema } from 'effect'
import { JsDocAnalysis } from '../jsdoc/JsDocAnalysis.js'
import { ParsedJsDoc } from '../jsdoc/ParsedJsDoc.js'
import { LineRange } from '../LineRange.js'

/**
 * Defines a schema for a documentable member, including its JSDoc analysis, parsed documentation, source location, and offset information.
 */
export const DocumentableMember = Schema.Struct({
  documentable: Schema.Literal(true),
  jsDoc: Schema.optional(JsDocAnalysis),
  parsedJsDoc: Schema.Union([Schema.Array(ParsedJsDoc), Schema.Undefined]),
  location: LineRange,
  startOffset: Schema.Number,
  /**
   * Leading whitespace of the declaration line, used when generating or updating JSDoc/TSDoc comments.
   */
  docIndent: Schema.String.annotate({
    description:
      'Leading whitespace of the declaration line, used when generating or updating JSDoc/TSDoc comments.',
  }),
})

/**
 * The TypeScript type representation for a DocumentableMember.
 */
export type DocumentableMember = Schema.Schema.Type<typeof DocumentableMember>
