import type { RawJsDoc } from './RawJsDoc.js'

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

  protectedRegions: Array<ProtectedRegion>

  generator?: GeneratorMarker

  humanEditSignals: Array<HumanEditSignal>
  raw: RawJsDoc
}
export interface HumanEditSignal {
  type:
    | 'manual-format'
    | 'custom-section'
    | 'non-generated-tag'
    | 'complex-markdown'
    | 'custom-example'

  score: number
  details?: {
    tagName?: string
    pattern?: string
    source?: string
  }
}
export interface HumanEditContext {
  source: 'summary' | 'remarks' | 'example' | 'tag'

  tagName?: string
}

export interface GeneratorMarker {
  tool: string
  version?: string
  raw: string
}

export interface ProtectedRegion {
  start: number
  end: number
  content: string
}
export interface JsDocReturns {
  description?: string
  raw?: string
}
export interface JsDocThrows {
  type?: string
  description?: string
  raw?: string
  order: number
}
export interface JsDocParam {
  /**
   * Parameter name.
   */
  name: string

  /**
   * Parameter type as string, if available.
   */
  type?: string

  /**
   * Parameter description.
   */
  description?: string

  /**
   * Whether the parameter is optional.
   */
  optional?: boolean

  /**
   * Original raw tag text.
   */
  raw?: string

  /**
   * Physical order within the block.
   */
  order: number
}

export interface ParsedTag {
  /**
   * Tag name without '@'.
   *
   * Example:
   * 'param'
   * 'returns'
   * 'remarks'
   */
  tagName: string

  /**
   * Raw tag content.
   */
  text?: string

  /**
   * Original raw source.
   */
  raw?: string

  /**
   * Physical order within the block.
   */
  order: number
}
