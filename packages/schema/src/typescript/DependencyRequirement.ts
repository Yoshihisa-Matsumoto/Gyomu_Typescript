import type { MemberIdentityMemberPath } from './MemberAnalysis.js'

interface DependencySource {
  /**
   * Empty for the symbol itself.
   * ["constructor"], ["save"], ["config"] ...
   */
  readonly memberPath: MemberIdentityMemberPath
}

export type DependencyCandidate = {
  readonly source: DependencySource
  readonly target: LocalFileDependencyCandidate | ImportedSymbolDependency
}

export type SummaryDependency = {
  reason: 'parameter' | 'return' | 'property' | 'extends' | 'implements' | 'body' | 'generics'

  target: LocalFileDependencyCandidate | ImportedSymbolDependency
}
export const equalTargetCandidate = (
  a: LocalFileDependencyCandidate | ImportedSymbolDependency,
  b: LocalFileDependencyCandidate | ImportedSymbolDependency,
): boolean => {
  switch (a.scope) {
    case 'import':
      if (b.scope != 'import') return false
      return a.localName == b.localName
    case 'local-file':
      if (b.scope != 'local-file') return false
      return a.symbolName == b.symbolName
  }
}
export const equalSummaryDependency = (a: SummaryDependency, b: SummaryDependency): boolean => {
  return a.reason == b.reason && equalTargetCandidate(a.target, b.target)
}

type LocalFileDependencyCandidate = {
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
