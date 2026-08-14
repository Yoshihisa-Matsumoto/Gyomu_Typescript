import { Node, SyntaxKind } from 'ts-morph'
import { analyzeType, getVoidTypeResult } from '../type/analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { initializeMethodIdentity, prepareMethodAnalysis } from '../prepareMemberAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'
import { analyzeFunctionBody } from './analyzeFunctionBody.js'
import type {
  ArrowFunction,
  CallSignatureDeclaration,
  ConstructSignatureDeclaration,
  ConstructorDeclaration,
  Expression,
  FunctionTypeNode,
  GetAccessorDeclaration,
  IndexSignatureDeclaration,
  JSDocableNode,
  MethodDeclaration,
  MethodSignature,
  PropertySignature,
  ReturnStatement,
  SetAccessorDeclaration,
} from 'ts-morph'
import type {
  ChildAnalysisArg,
  MemberAnalysisResult,
  MemberAnalysisWithReservedResult,
} from '../../types.js'

import type {
  DocumentableMethodMemberAnalysis,
  MemberAccessor,
  NonDocumentableMethodMemberAnalysis,
  TypeAnalysis,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a function or method member, determining its metadata, generics, and return type.
 *
 * @param args The analysis arguments containing the function node and context.
 *
 * @param args2 Configuration object including static status, visibility, member name, and optional JSDoc node.
 *
 * @returns An analysis result containing either non-documentable or documentable method member details.
 */
export const analyzeFunctionMember = (
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
    isStatic: boolean | undefined
    visibility: MemberAccessor | undefined
    name: string
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): MemberAnalysisWithReservedResult<
  NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis
> => {
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
    registerSymbol,
  } = args
  const { name, jsDocableNode } = args2
  const isStatic = args2.isStatic ?? false
  const visibility = args2.visibility ?? 'public'
  const returnTypeNode = node.getReturnTypeNode()

  const newMemberPath = [...memberPath]
  if (name && name.length > 0) newMemberPath.push(name)

  const genericsResult = analyzeGenericsParameters({
    node,
    sourceRelativePath,
    metadata,
    memberPath: newMemberPath,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames: [],
    registerSymbol,
  })

  const newReservedNames = [...reservedNames, ...genericsResult.parameters]

  let initializer: Expression | undefined = undefined
  if (!returnTypeNode) {
    if (Node.isArrowFunction(node)) {
      const body = node.getBody()
      if (Node.isArrowFunction(body)) {
        initializer = body
      } else if (Node.isExpression(body)) initializer = body
      else if (Node.isBlock(body)) {
        const returnStatement = body
          .getStatements()
          .find((s) => s.getKind() == SyntaxKind.ReturnStatement)
        if (returnStatement) {
          initializer = (returnStatement as ReturnStatement).getExpression()
        }
      }
    }
  }

  const newTypeReservedName = []
  if (name && name.length > 0) newTypeReservedName.push(name)
  newTypeReservedName.push('$return')

  const returnType =
    returnTypeNode || initializer
      ? analyzeType(
          {
            node: returnTypeNode || initializer!,
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
            registerSymbol,
          },
          newTypeReservedName,
        )
      : getVoidTypeResult()

  return analyzeFunctionMemberInternal(
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

/**
 * Performs internal analysis for function or method members, including parameters, generics, and body evaluation.
 *
 * @param args The shared analysis context.
 *
 * @param args2 Internal configuration for the member being analyzed.
 *
 * @returns The internal analysis result containing member definition and extracted dependencies.
 */
export const analyzeFunctionMemberInternal = (
  args: ChildAnalysisArg<
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ConstructorDeclaration
    | ArrowFunction
    | GetAccessorDeclaration
    | SetAccessorDeclaration
  >,
  args2: {
    name: string
    isStatic: boolean
    visibility: MemberAccessor
    returnType: MemberAnalysisResult<TypeAnalysis> | undefined
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): MemberAnalysisWithReservedResult<
  NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis
> => {
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
    registerSymbol,
  } = args
  const { isStatic, visibility, returnType, jsDocableNode, name } = args2

  const methodPath = [...memberPath]
  if (name && name.length > 0) methodPath.push(name)

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
    registerSymbol,
  })

  const newReservedNames = [...reservedNames, ...genericsResult.parameters]
  const methodBodyResult = analyzeFunctionBody({
    ...args,
    memberPath: methodPath,
    registerSymbol: false,
  })

  let isAsync: boolean | undefined = undefined
  if (Node.isMethodDeclaration(node)) {
    isAsync = node.isAsync()
  } else if (Node.isConstructorDeclaration(node)) {
    isAsync = false
  } else {
    if (!returnType) isAsync = false
    else {
      if (returnType.member.structure?.kind == 'function') {
        const functionStructure = returnType.member.structure

        if (functionStructure.returnType.structure?.kind == 'reference') {
          if (functionStructure.returnType.structure.targetId.includes('Promise')) isAsync = true
        }
      }
    }
  }

  if (jsDocableNode) {
    const { id, identity, jsDoc, location, snippet, startOffset, parsedJsDoc } =
      prepareMethodAnalysis({
        sourcePath: sourceRelativePath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        methodName: name,
        node,
        jsDocableNode,
        options,
        registerSymbol,
      })
    const parametersResult = node.getParameters().map((p, index) =>
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
        reservedNames: newReservedNames,
        registerSymbol,
      }),
    )

    const method = {
      kind: 'method',
      documentable: true,
      name,
      id,
      identity,
      parameters: parametersResult.map((p) => p.member),

      snippet,

      returnType: returnType?.member,
      jsDoc,
      parsedJsDoc,

      location,
      startOffset,
      static: isStatic,
      declarationOrder: args.declarationOrder,
      visibility,
      ownerSymbolId,
      docIndent: computeIndent(
        args.sourceFullText,
        (args2.jsDocableNode ?? args.node).getStart(),
        (args2.jsDocableNode ?? args.node).getStartLinePos(),
      ),
      functionBody: methodBodyResult.functionBody,
      isAsync,
    } satisfies DocumentableMethodMemberAnalysis
    registerSymbolSymbolAnalysis(metadata, method, options, registerSymbol)
    return {
      member: method,
      dependencies: [
        ...genericsResult.dependencies,
        ...parametersResult.map((p) => p.dependencies).flat(),
        ...(returnType?.dependencies ?? []),

        ...methodBodyResult.dependencies,
      ],
      reservedNames: [...parametersResult.map((p) => p.reservedNames).flat()],
    }
  } else {
    const { id, identity } = initializeMethodIdentity(
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      name,
      node,
    )
    const parametersResult = node.getParameters().map((p, index) =>
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
        reservedNames: newReservedNames,
        registerSymbol,
      }),
    )
    return {
      member: {
        kind: 'method',
        documentable: false,
        name,
        id,
        identity,
        parameters: parametersResult.map((p) => p.member),

        returnType: returnType?.member,

        snippet: node.getText(),
        ownerSymbolId,
        static: isStatic,

        visibility,
        declarationOrder: args.declarationOrder,
        functionBody: methodBodyResult.functionBody,
        isAsync,
      } satisfies NonDocumentableMethodMemberAnalysis,
      dependencies: [
        ...parametersResult.map((p) => p.dependencies).flat(),
        ...(returnType?.dependencies ?? []),
        ...methodBodyResult.dependencies,
        ...genericsResult.dependencies,
      ],
      reservedNames: [...parametersResult.map((p) => p.reservedNames).flat()],
    }
  }
}
