import type { SymbolIdentity } from '../schemas/typescript/SymbolIdentity.js'

/**
 * Represents the analysis results for an exported symbol, which can be either a local export or a re-export.
 */
export type ExportAnalysis = LocalExportAnalysis | ReExportAnalysis

interface LocalExportAnalysis {
  kind: 'local'

  /**
   * The exported name. This may differ from the original symbol name when an alias is used.
   */
  exportedName: string

  identity: SymbolIdentity

  /**
   * Indicates if the symbol is exported as a default export.
   */
  isDefault: boolean

  /**
   * Indicates if the export is type-only.
   */
  isTypeOnly: boolean
}

interface ReExportAnalysis {
  kind: 're-export'

  moduleSpecifier: string

  exportedName?: string

  exportAll: boolean

  isTypeOnly: boolean
}
