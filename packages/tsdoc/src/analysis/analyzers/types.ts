import type {
  DependencyRequirement,
  ExportAnalysis,
  MemberIdentityMemberPath,
  ProjectRelativePath,
  SymbolAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { JSDocableNode } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'

export type JSDocableTagAnalysisArg<T extends JSDocableNode> = {
  declaration: T
  sourceRelativePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  name?: string
  memberPath: MemberIdentityMemberPath
  sourceFullText: string
  declarationOrder: number
}

export type StatementAnalysisResult = StatementAnalysisBaseResult
// NoDependency | SingleDependency | MultipleDependencies

type StatementAnalysisBaseResult = {
  exported: ReadonlyArray<ExportAnalysis>
  symbols: ReadonlyArray<SymbolAnalysis>
}

type NoDependency = StatementAnalysisBaseResult & {
  kind: 'none'
}

type SingleDependency = StatementAnalysisBaseResult & {
  kind: 'single'
  dependencies: ReadonlyArray<DependencyRequirement>
}

type MultipleDependencies = StatementAnalysisBaseResult & {
  kind: 'multiple'
  dependencyRequirements: ReadonlyMap<SymbolId, ReadonlyArray<DependencyRequirement>>
}
