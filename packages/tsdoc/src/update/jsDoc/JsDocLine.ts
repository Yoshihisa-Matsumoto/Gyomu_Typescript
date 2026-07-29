/**
 * Represents a single line within a JSDoc block, which can be text content, a tag, or an empty line.
 */
export type JsDocLine =
  | { type: 'text'; text: string }
  | { type: 'tag'; text: string }
  | { type: 'blank' }
