import type { FileSummary, PackageExportAnalysis } from '@gyomu/schema/concept'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Represents a single package export path associated with its source file.
 */
export type ResolvedPackageExport = { exportPath: string; sourceFile: ProjectRelativePath }

/**
 * Represents an export path associated with a collection of source files.
 */
export type ResolvedSourceFile = {
  exportPath: string
  sourceFiles: ReadonlyArray<ProjectRelativePath>
}

/**
 * The complete analysis output for package exports, containing file summaries and export analysis details.
 */
export type PackageExportAnalysisResult = {
  files: Array<FileSummary>
  exports: PackageExportAnalysis
}
