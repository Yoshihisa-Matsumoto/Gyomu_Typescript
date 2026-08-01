import { CodeBlockDefinition } from '@gyomu/schema/document'
import { Effect } from 'effect'
import type { DocumentContentTranslationStrategy } from '@gyomu/schema/document'
import type { CodeBlock } from '@gyomu/schema/schemas/document'

export const ParagraphTranslationStrategy: DocumentContentTranslationStrategy<typeof CodeBlock> = {
  definition: CodeBlockDefinition,
  retryContextUpdater: (args) => Effect.succeed(args.originalContext),
}
