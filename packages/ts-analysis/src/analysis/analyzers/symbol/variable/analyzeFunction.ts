import { Node, SyntaxKind } from 'ts-morph'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { analyzeType } from '../type/analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { createSymbolIdentity } from '../../../shared/createSymbolIdentity.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'

import type { ArrowFunction, Expression, FunctionExpression, VariableDeclaration } from 'ts-morph'
import type { SymbolPreparation } from '../prepareSymbolAnalysis.js'
import type {
  SignatureAnalysis,
  SymbolAnalysis,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'
import type { GetSignatureIdArg, TagAnalysisArg } from '../../types.js'

export const analyzeFunction = (
  args: TagAnalysisArg<VariableDeclaration>,
  prepared: SymbolPreparation,
  node: ArrowFunction | FunctionExpression,
) => {
  const name = args.declaration.getName()
  const identity: SymbolIdentity = {
    symbolId: SymbolId(name),
    signatureId: prepared.signature.id,
  }

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
    dependencyCandidates: prepared.dependencyCandidates ?? [],
  } satisfies SymbolAnalysis
  registerSymbolSymbolAnalysis(
    args.metadata,
    symbol,
    computeIndent(
      args.sourceFullText,
      args.declaration.getStart(),
      args.declaration.getStartLinePos(),
    ),
  )

  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

export const isFunctionLikeInitializer = (
  node: Expression | undefined,
): node is ArrowFunction | FunctionExpression =>
  Node.isArrowFunction(node) || Node.isFunctionExpression(node)

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
  } = args
  const { id } = createSymbolIdentity(declaration, sourceRelativePath, 'function')
  const identity: SymbolIdentity = {
    symbolId: SymbolId(nodeName),
    signatureId: SignatureId('function'),
  }
  let initializer: Expression | undefined = undefined
  if (!node.getReturnTypeNode()) {
    const body = node.getBody()
    if (Node.isExpression(body)) initializer = body
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
    }),
  )
  const returnTypeResult = analyzeType(
    {
      node: node.getReturnTypeNode() ?? initializer,
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
    },
    [nodeName, '$return'],
  )
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
