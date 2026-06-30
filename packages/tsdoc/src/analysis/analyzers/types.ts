import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import type {
  DependencyRequirement,
  ExportAnalysis,
  ImportAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
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
  dependencies: ReadonlyArray<DependencyRequirement>
}

type MultipleDependencies = StatementAnalysisBaseResult & {
  kind: 'multiple'
  dependencyRequirements: ReadonlyMap<SymbolId, ReadonlyArray<DependencyRequirement>>
}

export type StatementAnalysisArgument = {
  metadata: FileAnalysisMetadata
  sourceRelativePath: string
  memberPath: Array<string>
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
  ownerSymbolId: MemberIdentityOwnerSymbolId
  ownerSymbolIdentity: SymbolIdentity
  sourceFullText: string
  declarationOrder: number
  imported: Array<ImportAnalysis>
  options: AnalysisOptions | undefined
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
}
