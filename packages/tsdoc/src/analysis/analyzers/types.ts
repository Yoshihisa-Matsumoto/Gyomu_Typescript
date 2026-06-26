import type {
  ExportAnalysis,
  MemberIdentityMemberPath,
  SymbolAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { ProjectRelativePath } from '../types.js'
import type { JSDocableNode } from 'ts-morph'
import type { FileAnalysisMetadata } from '../file/FileAnalysisResult.js'
import type { DependencyRequirement } from '../graph/DependencyRequirement.js'

export type JSDocableTagAnalysisArg<T extends JSDocableNode> = {
  declaration: T
  sourceRelativePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  name?: string
  memberPath: MemberIdentityMemberPath
  sourceFullText: string
  declarationOrder: number
}

export interface StatementAnalysisResult {
  exported: ReadonlyArray<ExportAnalysis>
  symbols: ReadonlyArray<SymbolAnalysis>

  // dependencyRequirements: ReadonlyMap<SymbolId, ReadonlyArray<DependencyRequirement>>
}
