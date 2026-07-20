import type { FileSummary, PackageExportAnalysis } from '@gyomu/schema/concept'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export type ResolvedPackageExport = { exportPath: string; sourceFile: ProjectRelativePath }

export type ResolvedSourceFile = {
  exportPath: string
  sourceFiles: ReadonlyArray<ProjectRelativePath>
}

export type PackageExportAnalysisResult = {
  files: Array<FileSummary>
  exports: PackageExportAnalysis
}
