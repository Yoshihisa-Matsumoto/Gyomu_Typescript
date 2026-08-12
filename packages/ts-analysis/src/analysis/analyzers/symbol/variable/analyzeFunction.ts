import { Node, SyntaxKind } from 'ts-morph'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { analyzeType, getVoidTypeResult } from '../type/analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { createSymbolIdentity } from '../../../shared/createSymbolIdentity.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'

import { analyzeFunctionBody } from '../struct/analyzeFunctionBody.js'
import { tracePlaceIdentity } from '../../../trace/traceUtil.js'
import type {
  ArrowFunction,
  Expression,
  FunctionExpression,
  ReturnStatement,
  VariableDeclaration,
} from 'ts-morph'
import type { SymbolPreparation } from '../prepareSymbolAnalysis.js'
import type {
  SignatureAnalysis,
  SymbolAnalysis,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'
import type { GetSignatureIdArg, TagAnalysisArg } from '../../types.js'

/**
 * Analyzes a variable declaration representing a function or arrow function and registers it as a symbol.
 *
 * @param args The context for the variable declaration being analyzed.
 *
 * @param prepared Pre-analysis data including signature and JSDoc.
 *
 * @param node The function node to analyze.
 *
 * @returns An object containing the analyzed symbol and a boolean indicating if it is a default export.
 */
export const analyzeFunction = (
  args: TagAnalysisArg<VariableDeclaration>,
  prepared: SymbolPreparation,
  node: ArrowFunction | FunctionExpression,
): {
  symbol: SymbolAnalysis
  isDefault: boolean
} => {
  const { sourceRelativePath, metadata, imported, options, sourceFullText, registerSymbol } = args
  const name = args.declaration.getName()
  const identity: SymbolIdentity = {
    symbolId: SymbolId(name),
    signatureId: prepared.signature.id,
  }

  const methodBodyResult = analyzeFunctionBody({
    sourceRelativePath,
    metadata,
    node,
    ownerSymbolId: prepared.id,
    ownerSymbolIdentity: identity,
    memberPath: [],
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames: [],
    registerSymbol: false,
  })

  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'const',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    type: prepared.signature.returnType!,
    identity,
    startOffset: args.declaration
      .getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement)
      .getStart(),

    jsDoc: prepared.jsDoc,
    parsedJsDoc: prepared.parsedJsDoc,
    members: [],

    declarationOrder: args.declarationOrder,
    dependencyCandidates: [
      ...(prepared.dependencyCandidates ?? []),
      ...methodBodyResult.dependencies,
    ],
    docIndent: computeIndent(
      args.sourceFullText,
      args.declaration.getStart(),
      args.declaration.getStartLinePos(),
    ),
    functionBody: methodBodyResult.functionBody,
  } satisfies SymbolAnalysis
  registerSymbolSymbolAnalysis(args.metadata, symbol, args.options, registerSymbol)

  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

/**
 * Determines if the given expression node is a function or arrow function expression.
 *
 * @param node The expression node to inspect.
 *
 * @returns True if the node is an ArrowFunction or FunctionExpression.
 */
export const isFunctionLikeInitializer = (
  node: Expression | undefined,
): node is ArrowFunction | FunctionExpression =>
  Node.isArrowFunction(node) || Node.isFunctionExpression(node)

/**
 * Generates signature analysis for a function or arrow function declaration.
 *
 * @param args The arguments for signature generation.
 *
 * @param node The function node to generate the signature for.
 *
 * @param declarationOrder The order of declaration.
 *
 * @returns The generated SignatureAnalysis containing parameters and return type info.
 */
export const getFunctionSignature = (
  args: GetSignatureIdArg<VariableDeclaration>,

  node: ArrowFunction | FunctionExpression,

  declarationOrder: number,
): SignatureAnalysis => {
  const {
    declaration,
    sourceRelativePath,
    nodeName,
    memberPath,
    metadata,
    sourceFullText,
    imported,
    options,
    registerSymbol,
  } = args
  const { id } = createSymbolIdentity(declaration, sourceRelativePath, 'function')
  const identity: SymbolIdentity = {
    symbolId: SymbolId(nodeName),
    signatureId: SignatureId('function'),
  }
  tracePlaceIdentity(identity, args.options, 'getFunctionSignature')
  let initializer: Expression | undefined = undefined

  if (!node.getReturnTypeNode()) {
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
  const genericsResult = analyzeGenericsParameters({
    node,
    sourceRelativePath,
    metadata,
    memberPath,
    ownerSymbolId: id,
    ownerSymbolIdentity: identity,
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames: [],
    registerSymbol,
  })
  const parametersResult = node.getParameters().map((p, index) =>
    analyzeParameter({
      node: p,
      sourceRelativePath,
      metadata,
      ownerSymbolId: id,
      ownerSymbolIdentity: identity,
      memberPath,
      sourceFullText,
      declarationOrder: index,
      imported,
      options,
      reservedNames: genericsResult.parameters,
      registerSymbol,
    }),
  )
  const returnTypeResult =
    node.getReturnTypeNode() || initializer
      ? analyzeType(
          {
            node: node.getReturnTypeNode() ?? initializer!,
            memberPath,
            metadata,
            ownerSymbolId: id,
            ownerSymbolIdentity: identity,
            sourceRelativePath,
            sourceFullText,
            declarationOrder,
            imported,
            options,
            reservedNames: genericsResult.parameters,
            registerSymbol,
          },
          [nodeName, '$return'],
        )
      : getVoidTypeResult()

  return {
    id: SignatureId('function'),
    parameters: parametersResult.map((p) => p.member),

    returnType: returnTypeResult.member,
    dependencyCandidates: [
      ...genericsResult.dependencies,
      ...parametersResult.map((p) => p.dependencies).flat(),
      ...returnTypeResult.dependencies,
    ],
  }
}
