import type { MemberIdentityMemberPath } from './MemberAnalysis.js'

interface DependencySource {
  /**
   * Empty for the symbol itself.
   * ["constructor"], ["save"], ["config"] ...
   */
  readonly memberPath: MemberIdentityMemberPath
}

/**
 * Represents a candidate for a dependency, mapping a source to its corresponding target file or imported symbol.
 */
export type DependencyCandidate = {
  /**
   * The source identifying where the dependency originates.
   */
  readonly source: DependencySource

  /**
   * The target identifying the file or imported symbol dependency.
   */
  readonly target: LocalFileDependencyCandidate | ImportedSymbolDependency
}

/**
 * Represents a summarized dependency record, identifying the reason for the dependency and its target.
 */
export type SummaryDependency = {
  /**
   * The semantic reason for the dependency relationship.
   */
  reason: 'parameter' | 'return' | 'member' | 'extends' | 'implements' | 'body' | 'generics'

  /**
   * The target of the dependency.
   */
  target: LocalFileDependencyCandidate | ImportedSymbolDependency
}

/**
 * Determines if two target dependency candidates are equal based on their scope and identifying fields.
 *
 * @param a The first dependency candidate.
 *
 * @param b The second dependency candidate.
 *
 * @returns True if the candidates are equal; otherwise false.
 */
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

/**
 * Determines if two summary dependencies are equal by comparing their reasons and target candidates.
 *
 * @param a The first summary dependency.
 *
 * @param b The second summary dependency.
 *
 * @returns True if the summary dependencies are equal; otherwise false.
 */
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
