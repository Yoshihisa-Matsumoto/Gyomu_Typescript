import { Table } from '../schemas/document/content/Table.js'
import type {
  DocumentContentDefinitionBase,
  ValidationIssue,
} from './DocumentContentDefinitionBase.js'

/**
 * Validates that the structure of the destination table matches the source table, ensuring that the number of header cells and row cells remains consistent.
 *
 * @param source The original table structure.
 *
 * @param destination The translated or modified table to validate.
 *
 * @returns An object containing a list of validation issues and a boolean indicating if the table is valid.
 */
export const validateTable = (source: Table, destination: Table) => {
  const issues: Array<ValidationIssue> = []
  if (source.header.cells.length != destination.header.cells.length) {
    issues.push({
      code: 'TABLE_HEADER_CELL_COUNT_CHANGED',
      message: 'The translated table contains a different number of cells on header.',
      details: {
        sourceCount: source.header.cells.length.toString(),
        translatedCount: destination.header.cells.length.toString(),
      },
      repairInstruction: 'Translate again while preserving every table cells on header & rows',
    })
  }

  if (issues.length == 0) {
    const columnCount = source.header.cells.length

    if (source.rows.length != destination.rows.length) {
      issues.push({
        code: 'TABLE_ROWS_COUNT_CHANGED',
        message: 'The translated table contains a different number of rows.',
        details: {
          sourceCount: source.rows.length.toString(),
          translatedCount: destination.rows.length.toString(),
        },
        repairInstruction: 'Translate again while preserving every table rows',
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (issues.length == 0) {
      source.rows.forEach((sourceRow, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const destinationRow = destination.rows[index]!
        if (
          sourceRow.cells.length != destinationRow.cells.length ||
          sourceRow.cells.length != columnCount
        ) {
          issues.push({
            code: 'TABLE_ROW_CELL_COUNT_CHANGED',
            message: 'The translated table row contains a different number of cells .',
            translationId: index,
            details: {
              sourceCount: sourceRow.cells.length.toString(),
              translatedCount: destinationRow.cells.length.toString(),
            },
            repairInstruction: 'Translate again while preserving every table cells on  rows',
          })
        }
      })
    }
  }
  return { issues: issues, isValid: issues.length == 0 }
}

/**
 * Defines the document structure for tables, including the schema, translation instructions, and reconciliation validation logic.
 */
export const TableDefinition: DocumentContentDefinitionBase<typeof Table> = {
  type: 'table',
  schema: Table,
  translationInstruction:
    'you need to translate only `title` field if exist. If not exist, do not create sentense',
  reconciliation: {
    validate: validateTable,
  },
}
