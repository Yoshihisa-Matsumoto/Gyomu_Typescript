import { Schema } from 'effect'

/**
 * Defines a schema for a single table row containing an array of string cells.
 */
export const TableRow = Schema.Struct({
  cells: Schema.Array(Schema.String).annotate({
    description: 'Cells in a table row.',
  }),
}).annotate({
  description: 'A table row.',
})

/**
 * Defines a table schema comprising a fixed header row and a collection of data rows.
 */
export const Table = Schema.Struct({
  type: Schema.Literal('table'),

  header: TableRow,

  rows: Schema.Array(TableRow),
}).annotate({
  description: 'A table with a header row and data rows.',
})

/**
 * TypeScript type alias representing the evaluated Table schema.
 */
export type Table = Schema.Schema.Type<typeof Table>
