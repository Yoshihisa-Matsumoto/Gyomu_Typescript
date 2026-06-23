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
