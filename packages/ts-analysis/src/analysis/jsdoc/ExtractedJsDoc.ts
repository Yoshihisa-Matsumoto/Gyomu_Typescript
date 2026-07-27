import type { JsDocAnalysis, ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

/**
 * Represents the result of JSDoc extraction, containing the overall analysis and the individual parsed JSDoc components.
 */
export interface ExtractedJsDoc {
  /**
   * The aggregated analysis of the JSDoc extraction process.
   */
  analysis: JsDocAnalysis

  /**
   * A list of individual parsed JSDoc items.
   */
  parsed: Array<ParsedJsDoc>
}
