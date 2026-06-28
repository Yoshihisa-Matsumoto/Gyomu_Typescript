import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { initializeMethodIdentity, prepareMethodAnalysis } from '../prepareMemberAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'
import type {
  CallSignatureDeclaration,
  ConstructSignatureDeclaration,
  ConstructorDeclaration,
  FunctionTypeNode,
  GetAccessorDeclaration,
  IndexSignatureDeclaration,
  JSDocableNode,
  MethodDeclaration,
  MethodSignature,
  Node,
  PropertySignature,
  SetAccessorDeclaration,
} from 'ts-morph'
import type {
  DocumentableMethodMemberAnalysis,
  MemberAccessor,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  NonDocumentableMethodMemberAnalysis,
  ProjectRelativePath,
  TypeAnalysis,
} from '@gyomu/schema/typescript'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

// export const analyzeMethodMember = (args: {
//   sourcePath: ProjectRelativePath
//   metadata: FileAnalysisMetadata
//   node: MethodSignature
//   ownerSymbolId: MemberIdentityOwnerSymbolId
//   memberPath: MemberIdentityMemberPath
//   name: string
//   jsDocableNode: PropertySignature | InterfaceDeclaration | MethodSignature
// }): DocumentableMemberAnalysis => {
//   const { sourcePath, metadata, node, ownerSymbolId, memberPath, name, jsDocableNode } = args
//   const returnTypeNode = node.getReturnTypeNode()

//   // const name = node.getName()
//   const { identity, jsDoc, location, startOffset, snippet } = prepareMethodAnalysis(
//     sourcePath,
//     metadata,
//     ownerSymbolId,
//     memberPath,
//     name,
//     node,
//     jsDocableNode,
//   )

//   return {
//     kind: 'method',

//     name,
//     identity,
//     parameters: node
//       .getParameters()
//       .map((p) => analyzeParameter(p, sourcePath, metadata, ownerSymbolId, memberPath)),
//     snippet,
//     ...withOptional({
//       returnType: analyzeType({
//         node: returnTypeNode,
//         initializer: undefined,
//         memberPath,
//         metadata,
//         ownerSymbolId,
//         sourcePath,
//         nodeName: [name, '$return'],
//       }),
//       jsDoc,
//     }),
//     location,
//     startOffset,
//     static: false,

//     visibility: 'public',
//   }
// }

export const analyzeFunctionMember = (
  args: {
    sourcePath: ProjectRelativePath
    metadata: FileAnalysisMetadata

    node:
      | MethodSignature
      | FunctionTypeNode
      | MethodDeclaration
      | ((
          | PropertySignature
          | ConstructSignatureDeclaration
          | CallSignatureDeclaration
          | IndexSignatureDeclaration
          | GetAccessorDeclaration
          | SetAccessorDeclaration
        ) &
          FunctionTypeNode)

    ownerSymbolId: MemberIdentityOwnerSymbolId
    ownerSymbolIdentity: SymbolIdentity
    memberPath: MemberIdentityMemberPath
    name: string
    jsDocableNode: (JSDocableNode & Node) | undefined
    sourceFullText: string
    declarationOrder: number
  },
  isStatic: boolean = false,
  visibility: MemberAccessor = 'public',
): NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis => {
  const { sourcePath, memberPath, name, node, ownerSymbolId, ownerSymbolIdentity, metadata } = args
  const returnTypeNode = node.getReturnTypeNode()

  const returnType = analyzeType({
    node: returnTypeNode,
    initializer: undefined,
    memberPath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourcePath,
    nodeName: [name, '$return'],
    sourceFullText: args.sourceFullText,
    declarationOrder: args.declarationOrder,
  })
  return analyzeFunctionMemberInternal(args, {
    isStatic,
    visibility,
    returnType,
  })
}

export const analyzeFunctionMemberInternal = (
  args: {
    sourcePath: ProjectRelativePath
    metadata: FileAnalysisMetadata

    node: MethodSignature | FunctionTypeNode | MethodDeclaration | ConstructorDeclaration

    ownerSymbolId: MemberIdentityOwnerSymbolId
    ownerSymbolIdentity: SymbolIdentity
    memberPath: MemberIdentityMemberPath
    name: string
    jsDocableNode: (JSDocableNode & Node) | undefined
    sourceFullText: string
    declarationOrder: number
  },
  args2: {
    isStatic: boolean
    visibility: MemberAccessor
    returnType: TypeAnalysis | undefined
  },
): NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis => {
  const {
    sourcePath,
    memberPath,
    name,
    node,
    jsDocableNode,
    ownerSymbolId,
    ownerSymbolIdentity,
    metadata,
  } = args
  const { isStatic, visibility, returnType } = args2

  const childMemberPath = [...memberPath, '$parameters']
  if (jsDocableNode) {
    const { id, identity, jsDoc, location, snippet, startOffset, parsedJsDoc } =
      prepareMethodAnalysis(
        sourcePath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        name,
        node,
        jsDocableNode,
      )
    const method = {
      kind: 'method',
      documentable: true,
      name,
      id,
      identity,
      parameters: node.getParameters().map((p, index) =>
        analyzeParameter({
          node: p,
          sourceRelativePath: sourcePath,
          metadata,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: childMemberPath,
          sourceFullText: args.sourceFullText,
          declarationOrder: index,
        }),
      ),
      snippet,
      ...withOptional({
        returnType,
        jsDoc,
        parsedJsDoc,
      }),
      location,
      startOffset,
      static: isStatic,
      declarationOrder: args.declarationOrder,
      visibility,
      ownerSymbolId,
    } satisfies DocumentableMethodMemberAnalysis
    registerSymbolSymbolAnalysis(
      metadata,
      method,
      computeIndent(
        args.sourceFullText,
        (args.jsDocableNode ?? args.node).getStart(),
        (args.jsDocableNode ?? args.node).getStartLinePos(),
      ),
    )
    return method
  } else {
    const { id, identity } = initializeMethodIdentity(
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      name,
      node,
    )
    return {
      kind: 'method',
      documentable: false,
      name,
      id,
      identity,
      parameters: node.getParameters().map((p, index) =>
        analyzeParameter({
          node: p,
          sourceRelativePath: sourcePath,
          metadata,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: childMemberPath,
          sourceFullText: args.sourceFullText,
          declarationOrder: index,
        }),
      ),
      ...withOptional({
        returnType,
      }),
      snippet: node.getText(),
      ownerSymbolId,
      static: isStatic,

      visibility,
      declarationOrder: args.declarationOrder,
    } satisfies NonDocumentableMethodMemberAnalysis
  }
}
