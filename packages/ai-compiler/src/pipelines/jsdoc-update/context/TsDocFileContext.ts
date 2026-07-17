import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { TsDocSymbolContext } from './TsDocSymbolContext.js'

export interface TsDocFileContext {
  project: {
    name: string
  }

  source: {
    relativePath: string
  }

  symbols: Array<TsDocSymbolContext>

  retry?: {
    attempt: number
    missingSymboldentity: Array<SymbolIdentity>
  }
}
