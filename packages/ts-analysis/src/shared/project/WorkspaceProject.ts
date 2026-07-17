import type { PackageJsonAnalysis, WorkspaceRelativePath } from '@gyomu/schema/typescript'

export interface WorkspaceProject {
  rootPath: WorkspaceRelativePath
  name: string
  hasTypescript: boolean
  packageJson: PackageJsonAnalysis
}
