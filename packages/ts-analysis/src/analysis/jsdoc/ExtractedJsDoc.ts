import type { JsDocAnalysis, ParsedJsDoc } from '@gyomu/schema/typescript'

export interface ExtractedJsDoc {
  analysis: JsDocAnalysis
  parsed: Array<ParsedJsDoc>
}
