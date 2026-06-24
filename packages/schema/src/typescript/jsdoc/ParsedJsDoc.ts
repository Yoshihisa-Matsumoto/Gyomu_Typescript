import type { JsDocParam, JsDocReturns, JsDocThrows, ParsedTag } from './JsDocParam.js'
import type { GeneratorMarker, ProtectedRegion } from './ProtectedRegion.js'
import type { HumanEditSignal } from './HumanEditSignal.js'
import type { RawJsDoc } from './RawJsDoc.js'
import type { ProtectedSection } from './ProtectedSection.js'

export interface ParsedJsDoc {
  summary?: string

  remarks?: string

  examples: Array<string>

  params: Array<JsDocParam>

  returns?: JsDocReturns

  throws: Array<JsDocThrows>

  templates: Array<string>

  deprecated?: string

  tags: Array<ParsedTag>

  protectedSection: Array<ProtectedSection>
  protectedRegions: Array<ProtectedRegion>

  generator?: GeneratorMarker

  humanEditSignals: Array<HumanEditSignal>
  raw: RawJsDoc

  startOffset: number

  endOffset: number
}
