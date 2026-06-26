import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { ProjectRelativePath } from '../types.js'

export type DependencyRequirement =
  | LocalFileDependency
  | SamePackageDependency
  | WorkspaceDependency
  | ExternalDependency

type LocalFileDependency = {
  scope: 'local-file'
  symbol: SymbolIdentity
}

type SamePackageDependency = {
  scope: 'same-package'
  importPath: ProjectRelativePath
  exportedName: string
}

type WorkspaceDependency = {
  scope: 'workspace'
  packageName: string
  importPath: ProjectRelativePath
  exportedName: string
}

type ExternalDependency = {
  scope: 'external'
  packageName: string
  importPath: string
  exportedName: string
}
