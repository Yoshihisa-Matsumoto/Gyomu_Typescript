import { ParagraphDefinition } from '@gyomu/schema/document'
import { Effect } from 'effect'
import type { DocumentContentTranslationStrategy } from '@gyomu/schema/document'
import type { Paragraph } from '@gyomu/schema/schemas/document'

export const ParagraphTranslationStrategy: DocumentContentTranslationStrategy<typeof Paragraph> = {
  definition: ParagraphDefinition,
  retryContextUpdater: (args) =>
    Effect.succeed({ context: args.originalContext, validation: args.currentValidation }),
}
