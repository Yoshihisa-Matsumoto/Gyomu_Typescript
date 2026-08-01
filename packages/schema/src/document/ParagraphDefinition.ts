import { Paragraph } from '../schemas/document/content/Paragraph.js'
import type { DocumentContentDefinitionBase } from './DocumentContentDefinitionBase.js'

export const ParagraphDefinition: DocumentContentDefinitionBase<typeof Paragraph> = {
  type: 'paragraph',
  schema: Paragraph,
  reconciliation: { validate: (source, destination) => ({ issues: [], isValid: true }) },
  translationInstruction: 'you need to translate only `text` field',
}
