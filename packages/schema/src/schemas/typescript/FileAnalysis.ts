import { Schema } from 'effect'
import { ImportAnalysis } from './ImportAnalysis.js'
import { ExportAnalysis } from './EportAnalysis.js'
import { SymbolAnalysis } from './SymbolAnalysis.js'

/**
 * Complete analysis result for a source file.
 *
 * Contains extracted symbol information,
 * dependency relationships, metrics,
 * and scoring hints used for TSDoc generation.
 */
export const FileAnalysisSchema = Schema.Struct({
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

export type FileAnalysis = typeof FileAnalysisSchema.Type
