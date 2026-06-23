import type { SymbolIdentity } from '../../schemas/typescript/SymbolIdentity.js'

export interface GeneratorMarker {
  tool: string
  version?: string
  raw: string
}

export interface ProtectedRegion {
  start: number
  end: number
  content: string
  before?: SymbolIdentity | undefined
  after?: SymbolIdentity | undefined
}
