import { Schema } from 'effect'

import { MemberIdentityMemberPath } from './MemberIdentityMemberPath.js'

export const DependencySource = Schema.Struct({
  memberPath: MemberIdentityMemberPath.annotate({
    description: `Empty for the symbol itself.

["constructor"], ["save"], ["config"] ...`,
  }),
}).annotate({
  description: 'Identifies the source location where a dependency originates.',
})

export type DependencySource = Schema.Schema.Type<typeof DependencySource>

export const LocalFileDependencyCandidate = Schema.Struct({
  scope: Schema.Literal('local-file').annotate({
    description: 'Indicates that the dependency target is defined within the same file.',
  }),

  localSymbolName: Schema.String.annotate({
    description: 'The name of the referenced symbol defined in the same file.',
  }),
}).annotate({
  description: 'Represents a dependency candidate targeting a symbol within the same file.',
})

export type LocalFileDependencyCandidate = Schema.Schema.Type<typeof LocalFileDependencyCandidate>

export const ImportedSymbolDependency = Schema.Struct({
  scope: Schema.Literal('import').annotate({
    description: 'Indicates that the dependency target is an imported symbol.',
  }),

  localSymbolName: Schema.String.annotate({
    description: 'The local name used to reference the imported symbol.',
  }),
}).annotate({
  description: 'Represents a dependency candidate targeting an imported symbol.',
})

export type ImportedSymbolDependency = Schema.Schema.Type<typeof ImportedSymbolDependency>

export const DependencyCandidate = Schema.Struct({
  source: DependencySource.annotate({
    description: 'The source identifying where the dependency originates.',
  }),

  target: Schema.Union([LocalFileDependencyCandidate, ImportedSymbolDependency]).annotate({
    description: 'The target identifying the file or imported symbol dependency.',
  }),
}).annotate({
  description:
    'Represents a candidate for a dependency, mapping a source to its corresponding target file or imported symbol.',
})

export type DependencyCandidate = Schema.Schema.Type<typeof DependencyCandidate>

export const DependencyReason = Schema.Literals([
  'parameter',
  'return',
  'member',
  'extends',
  'implements',
  'body',
  'generics',
])

export type DependencyReason = Schema.Schema.Type<typeof DependencyReason>
export const DependencySummary = Schema.Struct({
  reason: DependencyReason.annotate({
    description: 'The semantic reason for the dependency relationship.',
  }),

  target: Schema.Union([LocalFileDependencyCandidate, ImportedSymbolDependency]).annotate({
    description: 'The target of the dependency.',
  }),
}).annotate({
  description:
    'Represents a summarized dependency record, identifying the reason for the dependency and its target.',
})

export type DependencySummary = Schema.Schema.Type<typeof DependencySummary>

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
      return a.localSymbolName == b.localSymbolName
    case 'local-file':
      if (b.scope != 'local-file') return false
      return a.localSymbolName == b.localSymbolName
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
export const equalDependencySummary = (a: DependencySummary, b: DependencySummary): boolean => {
  return a.reason == b.reason && equalTargetCandidate(a.target, b.target)
}
