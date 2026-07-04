import type { JsDocAnalysis, ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

export interface ExtractedJsDoc {
  analysis: JsDocAnalysis
  parsed: Array<ParsedJsDoc>
}
