import { analyzeFunctionMember } from '../struct/analyzeFunctionMember.js'
import { getAccessor } from './analyzeClassPropertyMember.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { MethodDeclaration } from 'ts-morph'
import type {
  DocumentableMethodMemberAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  NonDocumentableMethodMemberAnalysis,
} from '../../../symbol/MemberAnalysis.js'
import type { ProjectRelativePath } from '../../../types.js'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'

export const analyzeClassMethodMember = (args: {
  sourcePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  node: MethodDeclaration
  ownerSymbolId: MemberIdentityOwnerSymbolId
  ownerSymbolIdentity: SymbolIdentity
  memberPath: MemberIdentityMemberPath
  name: string
  jsDocableNode: MethodDeclaration
  sourceFullText: string
  declarationOrder: number
}): DocumentableMethodMemberAnalysis | NonDocumentableMethodMemberAnalysis => {
  return analyzeFunctionMember(args, args.node.isStatic(), getAccessor(args.node))
  // const { sourcePath, metadata, node, ownerSymbolId, memberPath, name, jsDocableNode } = args
  // const returnTypeNode = node.getReturnTypeNode()

  // const { identity, jsDoc, location, startOffset, snippet } = prepareMethodAnalysis(
  //   sourcePath,
  //   metadata,
  //   ownerSymbolId,
  //   memberPath,
  //   name,
  //   node,
  //   jsDocableNode,
  // )
  // return {
  //   kind: 'method',
  //   name,
  //   identity,
  //   parameters: node
  //     .getParameters()
  //     .map((p) => analyzeParameter(p, sourcePath, metadata, ownerSymbolId, memberPath)),

  //   snippet,
  //   ...withOptional({
  //     returnType: analyzeType({
  //       node: returnTypeNode,
  //       initializer: undefined,
  //       memberPath,
  //       metadata,
  //       ownerSymbolId,
  //       sourcePath,
  //       nodeName: [name, '$return'],
  //     }),
  //     jsDoc,
  //   }),
  //   location,
  //   startOffset,

  //   static: node.isStatic(),
  //   visibility: getAccessor(node),
  // }
}
