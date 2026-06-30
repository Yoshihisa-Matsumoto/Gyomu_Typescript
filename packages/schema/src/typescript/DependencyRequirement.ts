interface DependencySource {
  /**
   * Empty for the symbol itself.
   * ["constructor"], ["save"], ["config"] ...
   */
  readonly memberPath: ReadonlyArray<string>
}

export type DependencyRequirement = {
  readonly source: DependencySource
  readonly target: LocalFileDependency | ImportedSymbolDependency
}

type LocalFileDependency = {
  scope: 'local-file'
  symbolName: string
}

type ImportedSymbolDependency = {
  scope: 'import'
  localName: string
}

// type SamePackageDependency = {
//   scope: 'same-package'
//   importPath: ProjectRelativePath
//   exportedName: string
// }

// type WorkspaceDependency = {
//   scope: 'workspace'
//   packageName: string
//   importPath: ProjectRelativePath
//   exportedName: string
// }

// type ExternalDependency = {
//   scope: 'external'
//   packageName: string
//   importPath: string
//   exportedName: string
// }
