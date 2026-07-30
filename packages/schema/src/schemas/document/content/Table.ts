import { Schema } from 'effect'

export const TableRow = Schema.Struct({
  cells: Schema.Array(Schema.String).annotate({
    description: 'Cells in a table row.',
  }),
}).annotate({
  description: 'A table row.',
})

export const Table = Schema.Struct({
  type: Schema.Literal('table'),

  header: TableRow,

  rows: Schema.Array(TableRow),
}).annotate({
  description: 'A table with a header row and data rows.',
})

export type Table = Schema.Schema.Type<typeof Table>
