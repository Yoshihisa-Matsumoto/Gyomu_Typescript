import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'
import { analyzeType } from './analyzeType.js'
import { analyzeTypeProperty } from './analyzeTypeProperty.js'
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
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type { FunctionStructureAnalysis, TypeAnalysis } from '@gyomu/schema/typescript'
import type { MemberAccessor } from '@gyomu/schema/schemas/typescript'

export const analyzeTypeFunction = (
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
): MemberAnalysisResult<FunctionStructureAnalysis> => {
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
    reservedNames,
  } = args
  const { name, jsDocableNode } = args2
  const isStatic = args2.isStatic ?? false
  const visibility = args2.visibility ?? 'public'
  const returnTypeNode = node.getReturnTypeNode()

  const genericsResult = analyzeGenericsParameters({
    node,
    sourceRelativePath,
    metadata,
    memberPath: [...memberPath, name],
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames: [],
  })

  const newReservedNames = [...reservedNames, ...genericsResult.parameters]

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
      reservedNames: newReservedNames,
    },
    [name, '$return'],
  )
  return analyzeTypeFunctionInternal(
    { ...args, reservedNames: newReservedNames },
    {
      name,
      jsDocableNode,
      isStatic,
      visibility,
      returnType,
    },
  )
}

const analyzeTypeFunctionInternal = (
  args: ChildAnalysisArg<
    MethodSignature | FunctionTypeNode | MethodDeclaration | ConstructorDeclaration
  >,
  args2: {
    name: string
    isStatic: boolean
    visibility: MemberAccessor
    returnType: MemberAnalysisResult<TypeAnalysis> | undefined
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): MemberAnalysisResult<FunctionStructureAnalysis> => {
  const {
    sourceRelativePath,
    memberPath,
    declarationOrder,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    metadata,
    imported,
    options,
    reservedNames,
  } = args
  const { isStatic, visibility, returnType, jsDocableNode, name } = args2

  const methodPath = [...memberPath, name]
  const childMemberPath = [...methodPath, '$parameters']

  const genericsResult = analyzeGenericsParameters({
    node,
    sourceRelativePath,
    metadata,
    memberPath: methodPath,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    declarationOrder,
    imported,
    options,
    reservedNames,
  })

  const newReservedNames = [...reservedNames, ...genericsResult.parameters]
  const parametersResult = node.getParameters().map((p, index) =>
    analyzeTypeProperty({
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
      reservedNames: newReservedNames,
    }),
  )

  {
    return {
      member: {
        kind: 'function',

        parameters: parametersResult.map((p) => p.member),

        returnType: returnType?.member,
      } satisfies FunctionStructureAnalysis,
      dependencies: [
        ...parametersResult.map((p) => p.dependencies).flat(),
        ...(returnType?.dependencies ?? []),
        ...genericsResult.dependencies,
      ],
    }
  }
}
