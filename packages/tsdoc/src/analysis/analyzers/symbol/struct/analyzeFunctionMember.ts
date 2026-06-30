import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { initializeMethodIdentity, prepareMethodAnalysis } from '../prepareMemberAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import type { ChildAnalysisArg } from '../../types.js'
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
  NonDocumentableMethodMemberAnalysis,
  TypeAnalysis,
} from '@gyomu/schema/typescript'

export const analyzeFunctionMember = (
  args: ChildAnalysisArg<
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
  >,
  args2: {
    isStatic: boolean | undefined
    visibility: MemberAccessor | undefined
    name: string
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis => {
  const {
    sourceRelativePath,
    memberPath,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    metadata,
    imported,
    options,
    sourceFullText,
    declarationOrder,
  } = args
  const { name, jsDocableNode } = args2
  const isStatic = args2.isStatic ?? false
  const visibility = args2.visibility ?? 'public'
  const returnTypeNode = node.getReturnTypeNode()

  const returnType = analyzeType(
    {
      node: returnTypeNode,
      memberPath,
      metadata,
      ownerSymbolId,
      ownerSymbolIdentity,
      sourceRelativePath,
      sourceFullText,
      declarationOrder,
      imported,
      options,
    },
    [name, '$return'],
  )
  return analyzeFunctionMemberInternal(args, {
    name,
    jsDocableNode,
    isStatic,
    visibility,
    returnType,
  })
}

export const analyzeFunctionMemberInternal = (
  args: ChildAnalysisArg<
    MethodSignature | FunctionTypeNode | MethodDeclaration | ConstructorDeclaration
  >,
  args2: {
    name: string
    isStatic: boolean
    visibility: MemberAccessor
    returnType: TypeAnalysis | undefined
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis => {
  const {
    sourceRelativePath,
    memberPath,

    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    metadata,
    imported,
    options,
  } = args
  const { isStatic, visibility, returnType, jsDocableNode, name } = args2

  const childMemberPath = [...memberPath, '$parameters']
  if (jsDocableNode) {
    const { id, identity, jsDoc, location, snippet, startOffset, parsedJsDoc } =
      prepareMethodAnalysis(
        sourceRelativePath,
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
          sourceRelativePath,
          metadata,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: childMemberPath,
          sourceFullText: args.sourceFullText,
          declarationOrder: index,
          imported,
          options,
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
        (args2.jsDocableNode ?? args.node).getStart(),
        (args2.jsDocableNode ?? args.node).getStartLinePos(),
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
          sourceRelativePath,
          metadata,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: childMemberPath,
          sourceFullText: args.sourceFullText,
          declarationOrder: index,
          imported,
          options,
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
