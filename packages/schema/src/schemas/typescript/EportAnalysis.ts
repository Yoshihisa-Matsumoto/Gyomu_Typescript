import { Schema } from 'effect'
import { SymbolIdentity } from './SymbolIdentity.js'

/**
 * Represents an export of a symbol declared within the current file.
 */
export const LocalExportAnalysis = Schema.Struct({
  kind: Schema.Literal('local').annotate({
    description: 'Indicates that the export refers to a symbol declared within the current file.',
  }),

  exportedName: Schema.String.annotate({
    description:
      'The exported name. This may differ from the original symbol name when an alias is used.',
  }),

  identity: SymbolIdentity,

  isDefault: Schema.Boolean.annotate({
    description: 'Indicates if the symbol is exported as a default export.',
  }),

  isTypeOnly: Schema.Boolean.annotate({
    description: 'Indicates if the export is type-only.',
  }),
}).annotate({
  description: 'Represents an export of a symbol declared within the current file.',
})

/**
 * The inferred TypeScript type for a local export analysis.
 */
export type LocalExportAnalysis = Schema.Schema.Type<typeof LocalExportAnalysis>

/**
 * Represents a re-export from another module.
 */
export const ReExportAnalysis = Schema.Struct({
  kind: Schema.Literal('re-export').annotate({
    description: 'Indicates that the export re-exports symbols from another module.',
  }),

  moduleSpecifier: Schema.String.annotate({
    description: 'The module specifier from which the symbols are re-exported.',
  }),

  exportedName: Schema.optional(
    Schema.String.annotate({
      description: 'The exported name when re-exporting a specific symbol.',
    }),
  ),

  exportAll: Schema.Boolean.annotate({
    description: 'Whether all exports from the target module are re-exported.',
  }),

  isTypeOnly: Schema.Boolean.annotate({
    description: 'Indicates if the export is type-only.',
  }),
}).annotate({
  description: 'Represents a re-export from another module.',
})

/**
 * The inferred TypeScript type for a re-export analysis.
 */
export type ReExportAnalysis = Schema.Schema.Type<typeof ReExportAnalysis>

/**
 * Represents the analysis results for an exported symbol, which can be either a local export or a re-export.
 */
export const ExportAnalysis = Schema.Union([LocalExportAnalysis, ReExportAnalysis]).annotate({
  description:
    'Represents the analysis results for an exported symbol, which can be either a local export or a re-export.',
})

/**
 * The inferred TypeScript type for an export analysis.
 */
export type ExportAnalysis = Schema.Schema.Type<typeof ExportAnalysis>
