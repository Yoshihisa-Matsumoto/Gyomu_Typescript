import type { ExportAnalysis, ImportAnalysis } from '@gyomu/schema/schemas/typescript'
import type { DependencyEdge } from '../graph/DependencyEdge.js'
import type { ProjectRelativePath, SymbolAnalysis } from '@gyomu/schema/typescript'

/**
 * Complete analysis result for a source file.
 *
 * Contains extracted symbol information,
 * dependency relationships, metrics,
 * and scoring hints used for TSDoc generation.
 */
export interface FileAnalysis {
  /**
   * Relative file path from project root.
   */
  path: ProjectRelativePath

  /**
   * Imported module analysis.
   */
  imports: Array<ImportAnalysis>

  /**
   * Exported symbol analysis.
   */
  exports: Array<ExportAnalysis>

  symbols: Array<SymbolAnalysis>

  /**
   * File dependency relationships.
   */
  dependencyGraph?: Array<DependencyEdge>
}
