import { Schema } from 'effect'
import { SymbolIdentity } from './SymbolIdentity.js'

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

export type LocalExportAnalysis = Schema.Schema.Type<typeof LocalExportAnalysis>

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

export type ReExportAnalysis = Schema.Schema.Type<typeof ReExportAnalysis>

export const ExportAnalysis = Schema.Union([LocalExportAnalysis, ReExportAnalysis]).annotate({
  description:
    'Represents the analysis results for an exported symbol, which can be either a local export or a re-export.',
})

export type ExportAnalysis = Schema.Schema.Type<typeof ExportAnalysis>
