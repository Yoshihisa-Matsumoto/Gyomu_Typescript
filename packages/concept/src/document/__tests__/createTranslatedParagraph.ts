import type { Paragraph } from '@gyomu/schema/schemas/document'

export const createTranslatedParagraph = (text = 'Translated paragraph'): Paragraph => ({
  type: 'paragraph',
  text,
})
