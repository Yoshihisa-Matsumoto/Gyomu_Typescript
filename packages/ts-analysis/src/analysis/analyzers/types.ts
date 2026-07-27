import type {
  DependencyCandidate,
  ExportAnalysis,
  ImportAnalysis,
  SymbolAnalysis,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'
import type {
  FileAnalysisMetadata,
  MemberIdentityMemberPath,
  ProjectRelativePath,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { Node } from 'ts-morph'
import type { AnalysisOptions } from '@gyomu/schema'

/**
 * Arguments provided for tag analysis, containing the node declaration and contextual metadata for a project member.
 */
export type TagAnalysisArg<T extends Node> = {
  declaration: T
  sourceRelativePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  memberPath: MemberIdentityMemberPath
  sourceFullText: string
  declarationOrder: number
  imported: Array<ImportAnalysis>
  options: AnalysisOptions | undefined
}

/**
 * Represents the result of a statement analysis operation.
 */
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
  dependencies: ReadonlyArray<DependencyCandidate>
}

type MultipleDependencies = StatementAnalysisBaseResult & {
  kind: 'multiple'
  DependencyCandidates: ReadonlyMap<SymbolId, ReadonlyArray<DependencyCandidate>>
}

/**
 * Arguments required to perform an analysis on a statement, including file metadata and existing import analysis.
 */
export type StatementAnalysisArgument = {
  metadata: FileAnalysisMetadata
  sourceRelativePath: ProjectRelativePath
  memberPath: MemberIdentityMemberPath
  sourceFullText: string
  declarationOrder: number
  imported: Array<ImportAnalysis>
  options: AnalysisOptions | undefined
}

/**
 * Arguments for analyzing a child node within a parent symbol, including owner identity and reserved names.
 */
export type ChildAnalysisArg<T> = {
  node: T
  sourceRelativePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  memberPath: MemberIdentityMemberPath
  ownerSymbolId: SymbolId
  ownerSymbolIdentity: SymbolIdentity
  sourceFullText: string
  declarationOrder: number
  imported: Array<ImportAnalysis>
  options: AnalysisOptions | undefined
  reservedNames: Array<string>
}

/**
 * Arguments required to resolve a unique signature ID for a specific node declaration.
 */
export type GetSignatureIdArg<T extends Node> = {
  declaration: T
  sourceRelativePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  memberPath: MemberIdentityMemberPath
  nodeName: string
  sourceFullText: string
  imported: Array<ImportAnalysis>
  options: AnalysisOptions | undefined
  reservedNames: Array<string>
}

/**
 * The result of a member analysis, providing the member object and its identified dependencies.
 */
export type MemberAnalysisResult<T> = {
  member: T
  dependencies: Array<DependencyCandidate>
}

/**
 * A variant of member analysis result that includes a list of reserved names.
 */
export type MemberAnalysisWithReservedResult<T> = {
  member: T
  dependencies: Array<DependencyCandidate>
  reservedNames: Array<string>
}

/**
 * Represents the dependency analysis result for a class or object method.
 */
export type MethodAnalysisResult = {
  dependencies: Array<DependencyCandidate>
}

/**
 * Contains the results of generic parameter analysis, including parameter names, dependencies, and optional definition name.
 */
export type GenericParameterAnalysisResult = {
  parameters: Array<string>
  dependencies: Array<DependencyCandidate>
  name: string | undefined
}
