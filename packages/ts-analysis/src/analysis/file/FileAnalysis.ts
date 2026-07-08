import { ExportAnalysis, ImportAnalysis, SymbolAnalysis } from '@gyomu/schema/schemas/typescript'
import { Schema } from 'effect'

/**
 * Complete analysis result for a source file.
 *
 * Contains extracted symbol information,
 * dependency relationships, metrics,
 * and scoring hints used for TSDoc generation.
 */
export const FileAnalysis = Schema.Struct({
  path: Schema.String.pipe(Schema.brand('ProjectRelativePath')).annotate({
    description: 'Relative file path from project root.',
  }),

  imports: Schema.Array(ImportAnalysis).annotate({
    description: 'Imported module analysis.',
  }),

  exports: Schema.Array(ExportAnalysis).annotate({
    description: 'Exported symbol analysis.',
  }),

  symbols: Schema.Array(SymbolAnalysis).annotate({
    description: 'Symbols declared in the source file.',
  }),
}).annotate({
  description:
    'Complete analysis result for a source file. Contains extracted symbol information, dependency relationships, metrics, and scoring hints used for TSDoc generation.',
})

export type FileAnalysis = typeof FileAnalysis.Type
