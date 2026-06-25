/**
 * Represents a parsed @returns JSDoc tag.
 */
export interface JsDocReturns {
  /**
   * Optional description of the returned value.
   */
  description?: string

  /**
   * The raw source text of the @returns tag.
   */
  raw?: string
}

/**
 * Represents a parsed @throws JSDoc tag.
 */
export interface JsDocThrows {
  /**
   * The type of the thrown error.
   */
  type?: string

  /**
   * Optional description of the error.
   */
  description?: string

  /**
   * The raw source text of the @throws tag.
   */
  raw?: string

  /**
   * The physical order of the tag within the JSDoc block.
   */
  order: number
}

/**
 * Represents the parsed structure of a JSDoc parameter tag.
 */
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

/**
 * Represents a generic parsed JSDoc tag.
 */
export interface ParsedTag {
  /**
   * Tag name without '@'.
   *
   * @example
   * 'param'
   * 'returns'
   * 'remarks'
   */
  tagName: string

  /**
   * Stable identifier used to distinguish tags that share the same tagName.
   *
   * @example
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
