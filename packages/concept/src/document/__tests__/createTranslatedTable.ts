import type { Table } from '@gyomu/schema/schemas/document'

export const createTranslatedTable = (): Table => ({
  type: 'table',
  header: { cells: ['Column 1', 'Column 2'] },
  rows: [{ cells: ['Gyomu', 'AI document builder'] }],
})
