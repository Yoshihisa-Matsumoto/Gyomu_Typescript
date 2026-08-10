import type { ParagraphDefinition } from './ParagraphDefinition.js'
import type { CodeBlockDefinition } from './CodeBlockDefinition.js'
import type { BulletListDefinition } from './BulletListDefinition.js'
import type { TableDefinition } from './TableDefinition.js'

/**
 * Defines a union of supported document content types, including paragraphs, bullet lists, code blocks, and tables.
 */
export type DocumentContentDefinition =
  | typeof ParagraphDefinition
  | typeof BulletListDefinition
  | typeof CodeBlockDefinition
  | typeof TableDefinition
