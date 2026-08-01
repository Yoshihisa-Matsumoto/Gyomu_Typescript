import type { ParagraphDefinition } from './ParagraphDefinition.js'
import type { CodeBlockDefinition } from './CodeBlockDefinition.js'
import type { BulletListDefinition } from './BulletListDefinition.js'
import type { TableDefinition } from './TableDefinition.js'

export type DocumentContentDefinition =
  | typeof ParagraphDefinition
  | typeof BulletListDefinition
  | typeof CodeBlockDefinition
  | typeof TableDefinition
