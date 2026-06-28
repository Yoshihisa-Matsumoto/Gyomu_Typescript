import { Node, SyntaxKind } from 'ts-morph'
import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import { analyzeParameter } from '../analyzeParameter.js'
import { createSymbolIdentity } from '../../../shared/createSymbolIdentity.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import type {
  MemberIdentityMemberPath,
  ProjectRelativePath,
  SignatureAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/typescript'

import type { ArrowFunction, Expression, FunctionExpression, VariableDeclaration } from 'ts-morph'
import type { SymbolPreparation } from '../prepareSymbolAnalysis.js'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'
import type { AnalysisOptions } from '../../../AnalysisOption.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeFunction = (
  args: {
    declaration: VariableDeclaration
    sourceRelativePath: ProjectRelativePath
    metadata: FileAnalysisMetadata
    name?: string
    options?: AnalysisOptions
    sourceFullText: string
    declarationOrder: number
  },
  prepared: SymbolPreparation,
  node: ArrowFunction | FunctionExpression,
) => {
  const name = args.name ?? args.declaration.getName()
  const identity: SymbolIdentity = {
    symbolId: name,
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
    ...withOptional({
      jsDoc: prepared.jsDoc,
      parsedJsDoc: prepared.parsedJsDoc,
      members: [],
    }),
    declarationOrder: args.declarationOrder,
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
  declaration: VariableDeclaration,
  node: ArrowFunction | FunctionExpression,
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  memberPath: MemberIdentityMemberPath,
  nodeName: string,
  sourceFullText: string,
  declarationOrder: number,
): SignatureAnalysis => {
  const { id } = createSymbolIdentity(declaration, sourcePath, 'function')
  const identity: SymbolIdentity = { symbolId: nodeName, signatureId: 'function' }
  let initializer: Expression | undefined = undefined
  if (!node.getReturnTypeNode()) {
    const body = node.getBody()
    if (Node.isExpression(body)) initializer = body
  }
  return {
    id: 'function',
    parameters: node.getParameters().map((p, index) =>
      analyzeParameter({
        node: p,
        sourceRelativePath: sourcePath,
        metadata,
        ownerSymbolId: id,
        ownerSymbolIdentity: identity,
        memberPath,
        sourceFullText,
        declarationOrder: index,
      }),
    ),
    ...withOptional({
      returnType: analyzeType({
        node: node.getReturnTypeNode(),
        initializer,
        memberPath,
        metadata,
        ownerSymbolId: id,
        ownerSymbolIdentity: identity,
        sourcePath,
        nodeName: [nodeName, '$return'],
        sourceFullText,
        declarationOrder,
      }),
    }),
  }
}
