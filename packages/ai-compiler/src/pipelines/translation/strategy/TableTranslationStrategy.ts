import { TableDefinition } from '@gyomu/schema/document'
import { Effect } from 'effect'
import type { DocumentContentTranslationStrategy } from '@gyomu/schema/document'
import type { Table } from '@gyomu/schema/schemas/document'

export const ParagraphTranslationStrategy: DocumentContentTranslationStrategy<typeof Table> = {
  definition: TableDefinition,
  retryContextUpdater: (args) => Effect.succeed(args.originalContext),
}
