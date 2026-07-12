import { Schema } from 'effect'

const symbolKinds = [
  'function',
  'type',
  'class',
  'interface',
  'const',
  'namespace',
  'enum',
] as const

/**
 * Defines the set of supported symbol kinds, including common TypeScript declarations like interfaces, types, classes, functions, constants, enums, and namespaces.
 */
export const SymbolKind = Schema.Literals(symbolKinds)

/**
 * The inferred TypeScript type for the SymbolKind schema.
 */
export type SymbolKind = Schema.Schema.Type<typeof SymbolKind>

export const isSymbolKind = (value: string): value is SymbolKind =>
  symbolKinds.includes(value as SymbolKind)
