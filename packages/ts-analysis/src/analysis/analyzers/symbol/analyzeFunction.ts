import { Node, SyntaxKind } from 'ts-morph'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { analyzeType, getVoidTypeResult } from './type/analyzeType.js'
import { computeIndent } from './computeIndent.js'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzeFunctionBody } from './struct/analyzeFunctionBody.js'
import { analyzeParameter } from './analyzeParameter.js'
import { analyzeGenericsParameters } from './analyzeGenericsParameters.js'

import type { Expression, FunctionDeclaration, ReturnStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  GetSignatureIdArg,
  MemberAnalysisWithReservedResult,
  TagAnalysisArg,
} from '../types.js'
import type {
  MemberAnalysis,
  SignatureAnalysis,
  SymbolAnalysis,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'

/**
 * Performs static analysis on a function declaration, extracting its signature, members, generics, return type, and body analysis.
 *
 * @param args The argument object containing the function declaration and associated analysis metadata.
 *
 * @returns An object containing the analyzed symbol, along with its export status.
 */
export const analyzeFunction = (
  args: TagAnalysisArg<FunctionDeclaration>,
): {
  symbol: SymbolAnalysis
  isDefault: boolean
  isExported: boolean
} => {
  const {
    sourceRelativePath,
    sourceFullText,
    imported,
    options,
    metadata,
    declaration,
    registerSymbol,
  } = args
  const typeName = args.declaration.getName() ?? ''
  const prepared = prepareSymbolAnalysis(
    {
      declaration,
      sourceRelativePath,
      metadata,
      memberPath: [],
      nodeName: typeName,
      imported,
      options,
      sourceFullText,
      reservedNames: [],
      registerSymbol,
    },
    getFunctionSignatureId,
  )
  const identity: SymbolIdentity = {
    symbolId: SymbolId(typeName),
    signatureId: prepared.signature.id,
  }
  const genericsResult = analyzeGenericsParameters({
    node: declaration,
    sourceRelativePath,
    metadata,
    memberPath: [],
    ownerSymbolId: prepared.id,
    ownerSymbolIdentity: identity,
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames: [],
    registerSymbol,
  })

  const membersResult = analyzeFunctionMembers({
    sourceRelativePath,
    metadata,
    node: declaration,
    ownerSymbolId: prepared.id,
    ownerSymbolIdentity: identity,
    memberPath: [],
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames: genericsResult.parameters,
    registerSymbol,
  })

  const returnTypeNode = declaration.getReturnTypeNode()
  let initializer: Expression | undefined = undefined
  if (!returnTypeNode) {
    const body = declaration.getBody()
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

  const returnTypeResult =
    returnTypeNode || initializer
      ? analyzeType(
          {
            node: returnTypeNode ?? initializer!,
            sourceRelativePath,
            metadata,
            ownerSymbolId: prepared.id,
            ownerSymbolIdentity: identity,
            memberPath: [],
            sourceFullText,
            declarationOrder: 0,
            imported,
            options,
            reservedNames: genericsResult.parameters,
            registerSymbol,
          },
          ['$return'],
          undefined,
        )
      : getVoidTypeResult()

  const methodBodyResult = analyzeFunctionBody(
    {
      sourceRelativePath,
      metadata,
      node: declaration,
      ownerSymbolId: prepared.id,
      ownerSymbolIdentity: identity,
      memberPath: [],
      sourceFullText,
      declarationOrder: 0,
      imported,
      options,
      reservedNames: genericsResult.parameters,
      registerSymbol: false,
    },
    // {
    //   isStatic: false,
    //   visibility: 'public',
    //   name: typeName,
    //   jsDocableNode: declaration,
    //   returnType: returnTypeResult,
    // },
  )
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'function',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    type: {
      text: typeName,
      source: 'typescript',
      effect: detectEffectSignals(typeName),
    },
    identity,
    startOffset: args.declaration.getStart(),
    jsDoc: prepared.jsDoc,
    parsedJsDoc: prepared.parsedJsDoc,
    members: membersResult.member,
    declarationOrder: args.declarationOrder,
    dependencyCandidates: [
      ...genericsResult.dependencies,
      ...membersResult.dependencies,
      ...(prepared.dependencyCandidates ?? []), // GenericsDependencyはprepared側に入っている
      ...methodBodyResult.dependencies,
      ...returnTypeResult.dependencies,
    ],
    docIndent: computeIndent(
      args.sourceFullText,
      args.declaration.getStart(),
      args.declaration.getStartLinePos(),
    ),
    functionBody: methodBodyResult.functionBody,
    isAsync: declaration.isAsync(),
  } satisfies SymbolAnalysis
  registerSymbolSymbolAnalysis(args.metadata, symbol, options, registerSymbol)
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
    isExported: args.declaration.isExported(),
  }
}
const normalizeTypeText = (text: string): string => text.replace(/import\([^)]*\)\./g, '')

const getFunctionSignatureId = (
  args: GetSignatureIdArg<FunctionDeclaration>,
): SignatureAnalysis => {
  const {
    declaration,
    sourceRelativePath,
    nodeName,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    options,
    reservedNames,
    registerSymbol,
  } = args
  const typeParams = declaration
    .getTypeParameters()
    .map((tp) => tp.getText())
    .join(',')
  const params = declaration
    .getParameters()
    .map((p) => {
      const type = normalizeTypeText(p.getType().getText(declaration))

      return `${p.getName()}:${type}`
    })
    .join(',')

  const returnTypeText = normalizeTypeText(declaration.getReturnType().getText(declaration))

  const symbolId = `${typeParams ? '(' + typeParams + ')' : ''}(${params}):${returnTypeText}`
  const genericsResult = analyzeGenericsParameters({
    node: declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    ownerSymbolId: SymbolId(symbolId),
    ownerSymbolIdentity: {
      symbolId: SymbolId(nodeName),
      signatureId: SignatureId(symbolId),
    },
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames,
    registerSymbol,
  })

  const returnTypeNode = declaration.getReturnTypeNode()
  let initializer: Expression | undefined = undefined
  if (!returnTypeNode) {
    const body = declaration.getBody()
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

  const returnTypeResult =
    returnTypeNode || initializer
      ? analyzeType(
          {
            node: returnTypeNode ?? initializer!,
            sourceRelativePath,
            metadata,
            ownerSymbolId: SymbolId(symbolId),
            ownerSymbolIdentity: {
              symbolId: SymbolId(nodeName),
              signatureId: SignatureId(symbolId),
            },
            memberPath,
            sourceFullText,
            declarationOrder: 0,
            imported,
            options,
            reservedNames,
            registerSymbol,
          },
          ['$return'],
          undefined,
        )
      : getVoidTypeResult()

  const overloadCount = declaration.getOverloads().length
  let isOverloadImplementation = false
  if (overloadCount > 0 && !declaration.isOverload()) {
    isOverloadImplementation = true
  }
  return {
    id: SignatureId(symbolId),
    parameters: [],
    overloadCount: declaration.getOverloads().length,
    isOverloadImplementation,
    returnType: returnTypeResult.member,
    dependencyCandidates: [...returnTypeResult.dependencies, ...genericsResult.dependencies],
  }
}

const analyzeFunctionMembers = (
  args: ChildAnalysisArg<FunctionDeclaration>,
): MemberAnalysisWithReservedResult<Array<MemberAnalysis>> => {
  const {
    node,
    sourceRelativePath,
    sourceFullText,
    metadata,
    memberPath,
    imported,
    options,
    ownerSymbolId,
    ownerSymbolIdentity,
    reservedNames,
    registerSymbol,
  } = args
  const parameters = node.getParameters().flatMap((member, index) => {
    const typeNode = member.getTypeNode()
    if (Node.isFunctionTypeNode(typeNode)) {
      return analyzeFunctionMember(
        {
          sourceRelativePath,
          metadata,
          node: typeNode,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          sourceFullText,
          declarationOrder: index,
          imported,
          options,
          reservedNames,
          registerSymbol,
        },
        {
          isStatic: undefined,
          visibility: undefined,
          name: member.getName(),
          jsDocableNode: node,
        },
      )
    }
    // console.log(`PropMember, ${index}`)
    return analyzeParameter({
      sourceRelativePath,
      metadata,
      node: member,
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      sourceFullText,
      declarationOrder: index,
      imported,
      options,
      reservedNames,
      registerSymbol,
    })
  })

  return {
    member: parameters.map((p) => p.member),
    dependencies: parameters.map((p) => p.dependencies).flat(),
    reservedNames: parameters.map((p) => p.reservedNames).flat(),
  }
}
