import { Schema } from 'effect'

/**
 * Defines the set of supported symbol kinds, including common TypeScript declarations like interfaces, types, classes, functions, constants, enums, and namespaces.
 */
export const SymbolKind = Schema.Literals([
  'interface',
  'type',
  'class',
  'function',
  'const',
  'enum',
  'namespace',
])

/**
 * The inferred TypeScript type for the SymbolKind schema.
 */
export type SymbolKind = Schema.Schema.Type<typeof SymbolKind>
