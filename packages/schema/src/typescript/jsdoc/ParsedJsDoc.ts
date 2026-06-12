import type { SymbolIdentity } from '../../schemas/typescript/SymbolIdentity.js'
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

  startOffset: number

  endOffset: number
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
  before?: SymbolIdentity | undefined
  after?: SymbolIdentity | undefined
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
  sortOrder: number
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
   * Stable identifier used to distinguish tags that share the same tagName.
   *
   * Examples:
   *
   * - `@template T` -> key = "T"
   * - `@template TResult` -> key = "TResult"
   * - `@param userId` -> key = "userId"
   * - `@throws ValidationError` -> key = "ValidationError"
   *
   * This value is used during merge planning and application to match
   * individual tags deterministically when multiple tags of the same
   * kind exist.
   *
   * Undefined when the tag does not expose a natural identifier.
   */
  key?: string

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
  sortOrder: number
}
