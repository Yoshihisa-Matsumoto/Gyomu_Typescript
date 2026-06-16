import type { DependencyEdge } from '../graph/DependencyEdge.js'
import type { ExportAnalysis } from '../symbol/ExportAnalysis.js'
import type { FileMetrics } from './FileMetrics.js'
import type { ImportAnalysis } from '../symbol/ImportAnalysis.js'
import type { ScoreHints } from '../metrics/ScoreHints.js'

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
  path: string

  /**
   * Imported module analysis.
   */
  imports: Array<ImportAnalysis>

  /**
   * Exported symbol analysis.
   */
  exports: Array<ExportAnalysis>

  /**
   * Aggregated file metrics.
   */
  metrics?: FileMetrics

  /**
   * File dependency relationships.
   */
  dependencyGraph?: Array<DependencyEdge>

  /**
   * Scoring hints used for documentation prioritization.
   */
  scoreHints?: ScoreHints
}
