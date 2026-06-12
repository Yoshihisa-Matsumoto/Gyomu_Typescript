import type { MemberIdentityMemberPath } from '@gyomu/schema/typescript'
import type { ProjectRelativePath } from '../types.js'
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
