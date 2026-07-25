import { Schema } from 'effect'
import { Paragraph } from './content/Paragraph.js'
import { BulletList } from './content/BulletList.js'
import { CodeBlock } from './content/CodeBlock.js'
import type { Builder } from '../../entity/type.js'

export const DocumentContent = Schema.Union([Paragraph, BulletList, CodeBlock]).annotate({
  description: 'A content block that can appear inside a document section.',
})

export type DocumentContent = Schema.Schema.Type<typeof DocumentContent>

export type EditableDocumentContent = Builder<Schema.Schema.Type<typeof DocumentContent>>
