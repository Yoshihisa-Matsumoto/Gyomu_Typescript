import { Schema } from 'effect'
import { JsDocAnalysis } from '../jsdoc/JsDocAnalysis.js'
import { ParsedJsDoc } from '../jsdoc/ParsedJsDoc.js'
import { LineRange } from '../LineRange.js'

export const DocumentableMember = Schema.Struct({
  documentable: Schema.Literal(true),
  jsDoc: Schema.optional(JsDocAnalysis),
  parsedJsDoc: Schema.Union([Schema.Array(ParsedJsDoc), Schema.Undefined]),
  location: LineRange,
  startOffset: Schema.Number,
})

export type DocumentableMember = Schema.Schema.Type<typeof DocumentableMember>
