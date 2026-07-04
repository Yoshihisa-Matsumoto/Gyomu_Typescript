import type {
  DependencyCandidate,
  ExportAnalysis,
  ImportAnalysis,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'
import type {
  MemberIdentityMemberPath,
  ProjectRelativePath,
  SymbolAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { Node } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../AnalysisOption.js'

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

export type StatementAnalysisArgument = {
  metadata: FileAnalysisMetadata
  sourceRelativePath: ProjectRelativePath
  memberPath: MemberIdentityMemberPath
  sourceFullText: string
  declarationOrder: number
  imported: Array<ImportAnalysis>
  options: AnalysisOptions | undefined
}

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

export type MemberAnalysisResult<T> = {
  member: T
  dependencies: Array<DependencyCandidate>
}

export type MethodAnalysisResult = {
  dependencies: Array<DependencyCandidate>
}

export type GenericParameterAnalysisResult = {
  parameters: Array<string>
  dependencies: Array<DependencyCandidate>
  name: string | undefined
}
