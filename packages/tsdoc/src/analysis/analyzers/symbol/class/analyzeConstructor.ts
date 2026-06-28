import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import { analyzeFunctionMemberInternal } from '../struct/analyzeFunctionMember.js'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { getAccessor } from './analyzeClassPropertyMember.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { ClassDeclaration, ConstructorDeclaration, ParameterDeclaration } from 'ts-morph'
import type {
  MemberAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  NonDocumentablePropertyMemberAnalysis,
  ProjectRelativePath,
} from '@gyomu/schema/typescript'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'

export const analyzeConstructor = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  node: ConstructorDeclaration,
  parent: ClassDeclaration,

  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  sourceFullText: string,
  declarationOrder: number,
): Array<MemberAnalysis> => {
  const name = '$constructor'

  const method = analyzeFunctionMemberInternal(
    {
      sourcePath,
      metadata,
      node,
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      jsDocableNode: node,
      name,
      sourceFullText,
      declarationOrder,
    },
    {
      isStatic: false,
      visibility: 'public',
      returnType: { text: parent.getName()!, source: 'typescript' },
    },
  )
  // const method: DocumentableMethodMemberAnalysis = {
  //   kind: 'method',
  //   documentable: true,
  //   name,
  //   identity,

  //   parameters: node
  //     .getParameters()
  //     .map((p) => analyzeParameter(p, sourcePath, metadata, ownerSymbolId, memberPath)),
  //   snippet,

  //   // returnType: { text: parent.getName()! },

  //   ...withOptional({
  //     returnType: analyzeType({
  //       node: undefined,
  //       initializer: undefined,
  //       memberPath,
  //       metadata,
  //       nodeName: [name],
  //       ownerSymbolId,
  //       sourcePath,
  //       rawText: parent.getName()!,
  //     }),
  //     jsDoc,
  //   }),
  //   location,
  //   startOffset,
  //   static: false,
  //   visibility: 'public',
  // }

  const parameters = node
    .getParameters()
    .filter((p) => p.getModifiers().length > 0)
    .map((v, index) =>
      analyzeClassPropertyFromConstructorParameters({
        sourcePath,
        metadata,
        node: v,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath: [],
        sourceFullText,
        declarationOrder: index,
      }),
    )

  return [method, ...parameters]
}
const analyzeClassPropertyFromConstructorParameters = (args: {
  sourcePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  node: ParameterDeclaration

  ownerSymbolId: MemberIdentityOwnerSymbolId
  ownerSymbolIdentity: SymbolIdentity
  memberPath: MemberIdentityMemberPath
  sourceFullText: string
  declarationOrder: number
}): NonDocumentablePropertyMemberAnalysis => {
  const {
    sourcePath,
    metadata,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    declarationOrder,
  } = args
  const typeNode = node.getTypeNode()
  const initializer = node.getInitializer()
  const nodeName = node.getName()
  const { id, identity } = createMemberIdentityAndId(
    {
      memberPath,
      ownerSymbolId,
      signatureId: nodeName,
    },
    ownerSymbolIdentity,
  )
  return {
    kind: 'property',
    documentable: false,
    source: 'constructor-parameter',
    id,
    ownerSymbolId,
    identity,
    rest: !!node.getDotDotDotToken(),
    name: nodeName,
    readonly: node.isReadonly(),
    optional: !!node.getQuestionTokenNode(),

    ...withOptional({
      type: analyzeType({
        node: typeNode,
        initializer,
        memberPath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        sourcePath,
        nodeName: [nodeName],
        sourceFullText: args.sourceFullText,
        declarationOrder: args.declarationOrder,
      }),
    }),
    static: false,
    visibility: getAccessor(node),
    declarationOrder,
  }
}
