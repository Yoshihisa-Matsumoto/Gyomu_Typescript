/**
 * Aggregated file-level metrics.
 */
export interface FileMetrics {
  /**
   * Total line count.
   */
  lineCount: number

  /**
   * Number of exports.
   */
  exportCount: number

  /**
   * Number of public symbols.
   */
  publicSymbolCount: number

  /**
   * Number of functions.
   */
  functionCount: number

  /**
   * Number of classes.
   */
  classCount: number

  /**
   * Number of interfaces.
   */
  interfaceCount: number

  /**
   * Aggregate type complexity score.
   */
  typeComplexity: number

  /**
   * Cyclomatic complexity score.
   */
  cyclomaticComplexity?: number

  /**
   * Number of dependencies.
   */
  dependencyCount: number
}
