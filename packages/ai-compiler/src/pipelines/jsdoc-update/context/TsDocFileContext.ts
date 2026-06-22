import type { TsDocSymbolContext } from './TsDocSymbolContext.js'

export interface TsDocFileContext {
  project: {
    name: string
  }

  source: {
    relativePath: string
  }

  symbols: Array<TsDocSymbolContext>
}
