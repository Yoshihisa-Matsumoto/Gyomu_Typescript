import type { SymbolKind } from '../schemas/typescript/SymbolKind.js'
import type { ProjectRelativePath } from '../typescript/types.js'

/**
 * Represents a summary of a source file, including its path, exported symbols, re-exports, and dependencies.
 */
export interface FileSummary {
  /**
   * The relative path of the file within the project.
   */
  path: ProjectRelativePath

  /**
   * A list of symbols exported from the file.
   */
  exports: Array<ExportSummary>

  /**
   * A list of modules re-exported by the file.
   */
  reExports: Array<ReExportSummary>

  /**
   * A list of dependencies required by the file.
   */
  dependencies: Array<DependencySummary>
}

/**
 * Defines metadata for an exported symbol, including its identifier, type kind, and documentation summary.
 */
export interface ExportSummary {
  /**
   * The name of the exported symbol.
   */
  symbol: string

  /**
   * The type of the exported symbol.
   */
  kind: SymbolKind

  /**
   * A summary or documentation for the exported symbol.
   */
  summary: string
}

/**
 * Defines re-export metadata, representing either an export-all module mapping or a specific symbol re-export.
 */
export type ReExportSummary =
  | {
      module: string

      exportAll: true
    }
  | {
      module: string

      exportAll: false

      symbol: string
    }

/**
 * Defines a file dependency, indicating the target module and whether it is an external dependency.
 */
export interface DependencySummary {
  /**
   * The identifier of the dependency, such as a file path or package name.
   */
  target: string

  /**
   * Indicates whether the dependency is external or internal to the project.
   */
  external: boolean
}
