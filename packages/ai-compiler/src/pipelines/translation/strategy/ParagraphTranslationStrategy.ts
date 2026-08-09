import { ParagraphDefinition } from '@gyomu/schema/document'
import { Effect } from 'effect'
import type { DocumentContentTranslationStrategy } from '@gyomu/schema/document'
import type { Paragraph } from '@gyomu/schema/schemas/document'

/**
 * Paragraph translation strategy implementing DocumentContentTranslationStrategy for Paragraph.
 */
export const ParagraphTranslationStrategy: DocumentContentTranslationStrategy<typeof Paragraph> = {
  definition: ParagraphDefinition,
  retryContextUpdater: (args) =>
    Effect.succeed({ context: args.originalContext, validation: args.currentValidation }),
}
