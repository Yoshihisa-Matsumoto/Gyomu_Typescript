import { CodeBlockDefinition } from '@gyomu/schema/document'
import { Effect } from 'effect'
import type { DocumentContentTranslationStrategy } from '@gyomu/schema/document'
import type { CodeBlock } from '@gyomu/schema/schemas/document'

/**
 * Translation strategy for handling code blocks within documents.
 */
export const CodeBlockTranslationStrategy: DocumentContentTranslationStrategy<typeof CodeBlock> = {
  definition: CodeBlockDefinition,
  retryContextUpdater: (args) =>
    Effect.succeed({ context: args.originalContext, validation: args.currentValidation }),
}
