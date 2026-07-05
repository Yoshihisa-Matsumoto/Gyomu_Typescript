import { Schema } from 'effect'

export const SymbolKind = Schema.Literals([
  'interface',
  'type',
  'class',
  'function',
  'const',
  'enum',
  'namespace',
])

export type SymbolKind = Schema.Schema.Type<typeof SymbolKind>
