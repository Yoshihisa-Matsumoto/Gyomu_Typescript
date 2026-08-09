import { TableDefinition } from '@gyomu/schema/document'
import { Effect } from 'effect'
import type { DocumentContentTranslationStrategy } from '@gyomu/schema/document'
import type { Table } from '@gyomu/schema/schemas/document'

/**
 * Translation strategy for table document content.
 */
export const TableTranslationStrategy: DocumentContentTranslationStrategy<typeof Table> = {
  definition: TableDefinition,
  retryContextUpdater: (args) =>
    Effect.succeed({ context: args.originalContext, validation: args.currentValidation }),
}
