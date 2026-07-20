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

/**
 * Type guard that checks if a value is a valid SymbolKind.
 *
 * @param value The value to check.
 *
 * @returns True if the value is a valid SymbolKind, otherwise false.
 */
export const isSymbolKind = (value: string): value is SymbolKind =>
  symbolKinds.includes(value as SymbolKind)
