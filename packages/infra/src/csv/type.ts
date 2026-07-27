/**
 * Represents a valid value that can be stored in a CSV cell.
 */
export type CsvValue = string | number | boolean | null | undefined

/**
 * Represents a single row of CSV data as a dictionary of key-value pairs.
 */
export type CsvRow = Record<string, CsvValue>

/**
 * Defines a column specification for mapping record fields to CSV headers.
 *
 * @template A - The type of the record being mapped.
 */
export type CsvColumn<A> = {
  key: keyof A & string
  header: string
}

/**
 * Configuration options for reading and parsing CSV data.
 *
 * @template R - The type of the record.
 */
export type CsvReadOption<R> = {
  fields?: ReadonlyArray<CsvColumn<R>>
  bom?: boolean
  encoding?: string
  filterRaw?: (row: Record<string, string>) => boolean
  filter?: (row: R) => boolean
  onInvalidRow?: (raw: unknown) => void
  skipInvalidRows?: boolean
}

/**
 * Configuration options for writing and formatting CSV data.
 *
 * @template R - The type of the record.
 */
export type CsvWriteOption<R> = {
  fields?: ReadonlyArray<CsvColumn<R>>
  quoted?: boolean
  bom?: boolean
  recordDelimiter?: 'windows' | 'unix'
}
