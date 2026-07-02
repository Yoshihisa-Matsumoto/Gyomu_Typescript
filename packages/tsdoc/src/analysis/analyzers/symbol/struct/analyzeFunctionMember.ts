import { Node } from 'ts-morph'
import { analyzeType } from '../analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { initializeMethodIdentity, prepareMethodAnalysis } from '../prepareMemberAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeDependency } from '../analyzeDependency.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'
import type {
  CallSignatureDeclaration,
  ConstructSignatureDeclaration,
  ConstructorDeclaration,
  FunctionDeclaration,
  FunctionTypeNode,
  GetAccessorDeclaration,
  IndexSignatureDeclaration,
  JSDocableNode,
  MethodDeclaration,
  MethodSignature,
  PropertySignature,
  SetAccessorDeclaration,
  Statement,
} from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisResult, MethodAnalysisResult } from '../../types.js'
import type {
  DependencyCandidate,
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
): MemberAnalysisResult<NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis> => {
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

export const analyzeFunctionMemberInternal = (
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
): MemberAnalysisResult<NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis> => {
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
  const methodBodyResult = analyzeFunctionBody({ ...args, memberPath: methodPath }, args2)
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
    return {
      member: method,
      dependencies: [
        ...genericsResult.dependencies,
        ...parametersResult.map((p) => p.dependencies).flat(),
        ...(returnType?.dependencies ?? []),

        ...methodBodyResult.dependencies,
      ],
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
      } satisfies NonDocumentableMethodMemberAnalysis,
      dependencies: [
        ...parametersResult.map((p) => p.dependencies).flat(),
        ...(returnType?.dependencies ?? []),
        ...methodBodyResult.dependencies,
        ...genericsResult.dependencies,
      ],
    }
  }
}

export const analyzeFunctionBody = (
  args: ChildAnalysisArg<
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ConstructorDeclaration
    | FunctionDeclaration
  >,
  args2: {
    name: string
    isStatic: boolean
    visibility: MemberAccessor
    returnType: MemberAnalysisResult<TypeAnalysis> | undefined
    jsDocableNode: (JSDocableNode & Node) | undefined
  },
): MethodAnalysisResult => {
  // console.log('analyzeFunctionBody', args2.name, args.node.getKindName())
  if (
    Node.isConstructorDeclaration(args.node) ||
    Node.isMethodDeclaration(args.node) ||
    Node.isFunctionDeclaration(args.node)
  ) {
    console.log('Constructor or Method', args2.name)
    const body = args.node.getBody()
    if (Node.isBlock(body)) {
      const statementsResult = body
        .getStatements()
        .map((statement) =>
          analyzeStatement({ ...args, memberPath: [...args.memberPath, '$body'] }, statement),
        )
        .flat()
      console.dir(statementsResult, { depth: 5 })
      return {
        dependencies: statementsResult.map((s) => s.dependencies).flat(),
      }
    }
  }
  return {
    dependencies: [],
  }
}

const analyzeStatement = (
  args: ChildAnalysisArg<
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ConstructorDeclaration
    | FunctionDeclaration
  >,
  bodyStatement: Statement,
): MethodAnalysisResult => {
  if (Node.isExpressionStatement(bodyStatement)) {
    const expression = bodyStatement.getExpression()
    console.log('ExpressionStatement', expression.getKindName(), expression.getText())
    if (Node.isCallExpression(expression)) {
      const expressionText = expression.getExpression().getText()
      const dependency = analyzeDependency(expressionText, args.imported, args.memberPath)
      return {
        dependencies: [dependency],
      }
    }
    if (Node.isNewExpression(expression)) {
      const expressionText = expression.getExpression().getText()
      console.log('NewExpression', expressionText)
      const dependency = analyzeDependency(expressionText, args.imported, args.memberPath)
      return {
        dependencies: [dependency],
      }
    }
    if (Node.isBinaryExpression(expression)) {
      const left = expression.getLeft()
      const right = expression.getRight()
      const leftDependencies = new Array<DependencyCandidate>()
      const rightDependencies = new Array<DependencyCandidate>()
      if (Node.isIdentifier(right)) {
        const rightText = right.getText()
        const dependency = analyzeDependency(rightText, args.imported, args.memberPath)
        rightDependencies.push(dependency)
      }
      if (Node.isPropertyAccessExpression(left)) {
        const expressionText = left.getExpression().getText()
        if (expressionText === 'this') {
          const leftName = left.getName()
          const dependency = analyzeDependency(leftName, args.imported, args.memberPath)
          leftDependencies.push(dependency)
        } else {
          const dependency = analyzeDependency(expressionText, args.imported, args.memberPath)
          leftDependencies.push(dependency)
        }
      }
      return {
        dependencies: [...leftDependencies, ...rightDependencies],
      }
    }
  }

  return {
    dependencies: [],
  }
}
