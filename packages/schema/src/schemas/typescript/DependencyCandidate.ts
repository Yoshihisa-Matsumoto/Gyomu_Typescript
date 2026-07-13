import { Schema } from 'effect'

import { MemberIdentityMemberPath } from './MemberIdentityMemberPath.js'

/**
 * Identifies the source location where a dependency originates.
 */
export const DependencySource = Schema.Struct({
  memberPath: MemberIdentityMemberPath.annotate({
    description: `Empty for the symbol itself.

["constructor"], ["save"], ["config"] ...`,
  }),
}).annotate({
  description: 'Identifies the source location where a dependency originates.',
})

/**
 * The type representation of a DependencySource schema.
 */
export type DependencySource = Schema.Schema.Type<typeof DependencySource>

/**
 * Represents a dependency candidate targeting a symbol within the same file.
 */
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

/**
 * The type representation of a LocalFileDependencyCandidate schema.
 */
export type LocalFileDependencyCandidate = Schema.Schema.Type<typeof LocalFileDependencyCandidate>

/**
 * Represents a dependency candidate targeting an imported symbol.
 */
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

/**
 * The type representation of an ImportedSymbolDependency schema.
 */
export type ImportedSymbolDependency = Schema.Schema.Type<typeof ImportedSymbolDependency>

/**
 * Represents a candidate for a dependency, mapping a source to its corresponding target file or imported symbol.
 */
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

/**
 * The type representation of a DependencyCandidate schema.
 */
export type DependencyCandidate = Schema.Schema.Type<typeof DependencyCandidate>

const dependencyReason = [
  'parameter',
  'return',
  'member',
  'extends',
  'implements',
  'body',
  'generics',
] as const

/**
 * Defines the semantic reasons for a dependency relationship, such as parameters, returns, members, or inheritance.
 */
export const DependencyReason = Schema.Literals(dependencyReason)

/**
 * Validates and returns a dependency reason if it exists within the allowed set.
 *
 * @param value The string value to validate as a dependency reason.
 *
 * @returns The valid DependencyReason or undefined if the value is not recognized.
 */
export const getDependencyReason = (value: string): DependencyReason | undefined => {
  if (dependencyReason.includes(value as DependencyReason)) return value as DependencyReason
  return undefined
}

/**
 * The type representation of a DependencyReason schema.
 */
export type DependencyReason = Schema.Schema.Type<typeof DependencyReason>

/**
 * Represents a summarized dependency record, identifying the reason for the dependency and its target.
 */
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

/**
 * The type representation of a DependencySummary schema.
 */
export type DependencySummary = Schema.Schema.Type<typeof DependencySummary>

/**
 * Determines if two target dependency candidates are equal based on their scope and identifying fields.
 *
 * @param a The first dependency candidate.
 *
 * @param b The second dependency candidate.
 *
 * @returns True if the dependency candidates are equal, false otherwise.
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
 * @returns True if the dependency summaries are equal, false otherwise.
 */
export const equalDependencySummary = (a: DependencySummary, b: DependencySummary): boolean => {
  return a.reason == b.reason && equalTargetCandidate(a.target, b.target)
}
