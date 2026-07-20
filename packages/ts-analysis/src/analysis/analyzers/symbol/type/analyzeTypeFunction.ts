import { analyzeType } from './analyzeType.js'
import { analyzeTypeProperty } from './analyzeTypeProperty.js'
import type {
  ArrowFunction,
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
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'

import type { FunctionStructureAnalysis, TypeAnalysis } from '@gyomu/schema/schemas/typescript'

export const analyzeTypeFunction = (
  args: ChildAnalysisArg<
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ArrowFunction
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
    name: string
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): MemberAnalysisWithReservedResult<FunctionStructureAnalysis> => {
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
  const returnTypeNode = node.getReturnTypeNode()

  // const genericsResult = analyzeGenericsParameters({
  //   node,
  //   sourceRelativePath,
  //   metadata,
  //   memberPath: [...memberPath, name],
  //   ownerSymbolId,
  //   ownerSymbolIdentity,
  //   sourceFullText,
  //   declarationOrder: 0,
  //   imported,
  //   options,
  //   reservedNames: [],
  // })

  const newReservedNames = [...reservedNames]

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
    name ? [name, '$return'] : ['$return'],
  )
  return analyzeTypeFunctionInternal(
    { ...args, reservedNames: newReservedNames },
    {
      name,
      jsDocableNode,
      returnType,
    },
  )
}

const analyzeTypeFunctionInternal = (
  args: ChildAnalysisArg<
    MethodSignature | FunctionTypeNode | MethodDeclaration | ConstructorDeclaration | ArrowFunction
  >,
  args2: {
    name: string
    returnType: MemberAnalysisWithReservedResult<TypeAnalysis>
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): MemberAnalysisWithReservedResult<FunctionStructureAnalysis> => {
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
  const { returnType, name } = args2

  const methodPath = name ? [...memberPath, name] : [...memberPath]
  const childMemberPath = [...methodPath, '$parameters']

  const newReservedNames = [...reservedNames]
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

        returnType: returnType.member,
      } satisfies FunctionStructureAnalysis,
      dependencies: [
        ...parametersResult.map((p) => p.dependencies).flat(),
        ...returnType.dependencies,
      ],
      reservedNames: [...parametersResult.map((p) => p.reservedNames).flat()],
    }
  }
}
