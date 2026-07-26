import { Schema } from 'effect'
import { Paragraph } from './content/Paragraph.js'
import { BulletList } from './content/BulletList.js'
import { CodeBlock } from './content/CodeBlock.js'
import type { Builder } from '../../entity/type.js'

/**
 * A union schema for content blocks that can appear inside a document section, supporting paragraphs, bullet lists, or code blocks.
 */
export const DocumentContent = Schema.Union([Paragraph, BulletList, CodeBlock]).annotate({
  description: 'A content block that can appear inside a document section.',
})

/**
 * The inferred type for a document content block.
 */
export type DocumentContent = Schema.Schema.Type<typeof DocumentContent>

/**
 * A builder type representation of the DocumentContent schema, intended for editable instances.
 */
export type EditableDocumentContent = Builder<Schema.Schema.Type<typeof DocumentContent>>
