import type { JsDocParam, JsDocReturns, JsDocThrows, ParsedTag } from './JsDocParam.js'
import type { GeneratorMarker, ProtectedRegion } from './ProtectedRegion.js'
import type { HumanEditSignal } from './HumanEditSignal.js'
import type { RawJsDoc } from './RawJsDoc.js'
import type { ProtectedSection } from './ProtectedSection.js'

/**
 * Represents the structural components and metadata extracted from a parsed JSDoc comment block.
 */
export interface ParsedJsDoc {
  /**
   * The brief summary description of the documented symbol.
   */
  summary?: string

  /**
   * Extended remarks or detailed description of the documented symbol.
   */
  remarks?: string

  /**
   * A collection of code examples associated with the symbol.
   */
  examples: Array<string>

  /**
   * An array of parameter definitions extracted from the JSDoc.
   */
  params: Array<JsDocParam>

  /**
   * Metadata describing the return value of the function.
   */
  returns?: JsDocReturns

  /**
   * An array of exception or error conditions defined in the JSDoc.
   */
  throws: Array<JsDocThrows>

  /**
   * A collection of generic type template names.
   */
  templates: Array<string>

  /**
   * Optional deprecation notice providing reasoning or replacement details.
   */
  deprecated?: string

  /**
   * A collection of custom or standard JSDoc tags found in the comment.
   */
  tags: Array<ParsedTag>

  /**
   * Segments of the original JSDoc block that are marked as protected from automatic modification.
   */
  protectedSection: Array<ProtectedSection>

  /**
   * Defined regions within the JSDoc that must not be altered during re-generation.
   */
  protectedRegions: Array<ProtectedRegion>

  /**
   * Optional marker indicating the tool or generator that created the JSDoc.
   */
  generator?: GeneratorMarker

  /**
   * Collection of signals detected that indicate manual modifications were performed on the JSDoc.
   */
  humanEditSignals: Array<HumanEditSignal>

  /**
   * The unparsed, raw representation of the JSDoc source content.
   */
  raw: RawJsDoc

  /**
   * The character offset indicating where the JSDoc comment begins in the source file.
   */
  startOffset: number

  /**
   * The character offset indicating where the JSDoc comment ends in the source file.
   */
  endOffset: number
}
