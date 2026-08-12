import { SignatureId } from '@gyomu/schema/typescript'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { prepareMemberAnalysis } from '../prepareMemberAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { analyzeType } from './analyzeType.js'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { IndexSignatureAnalysis } from '@gyomu/schema/schemas/typescript'
import type { IndexSignatureDeclaration } from 'ts-morph'

/**
 * Analyzes an index signature declaration within a TypeScript node and registers the resulting analysis.
 *
 * @param args The arguments required for index signature analysis.
 *
 * @returns Returns the analysis result for the index signature, including the member details, dependencies, and reserved names.
 */
export const analyzeIndexSignature = (
  args: ChildAnalysisArg<IndexSignatureDeclaration>,
): MemberAnalysisWithReservedResult<IndexSignatureAnalysis> => {
  const {
    node,
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    sourceFullText,
    declarationOrder,
    imported,
    options,
    reservedNames,
    registerSymbol,
  } = args

  const parameterName = node.getKeyName()

  const { id, identity } = createMemberIdentityAndId(
    {
      ownerSymbolId,
      memberPath,
      signatureId: SignatureId(parameterName),
    },
    ownerSymbolIdentity,
  )

  const { jsDoc, location, parsedJsDoc, snippet, startOffset } = prepareMemberAnalysis({
    sourcePath: sourceRelativePath,
    metadata,
    id,
    identity,
    node,
    jsDocableNode: node,
    options,
    registerSymbol,
  })

  const parameterTypeResult = analyzeType(
    {
      node: node.getKeyTypeNode(),

      sourceRelativePath,
      metadata,
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      sourceFullText,
      declarationOrder,
      imported,
      options,
      reservedNames,
      registerSymbol,
    },
    [parameterName],
    undefined,
  )
  const valueType = node.getReturnTypeNode()

  const valueTypeResult = analyzeType(
    {
      node: valueType!,

      sourceRelativePath,
      metadata,
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      sourceFullText,
      declarationOrder,
      imported,
      options,
      reservedNames,
      registerSymbol,
    },
    ['$return'],
    undefined,
  )
  const signature = {
    documentable: true,
    readonly: node.isReadonly(),
    id,
    identity,
    kind: 'indexed-signature',
    parameterName,
    parameterType: parameterTypeResult.member,
    type: valueTypeResult.member,

    declarationOrder: args.declarationOrder,
    jsDoc,
    location,
    parsedJsDoc,
    startOffset,
    docIndent: computeIndent(sourceFullText, node.getStart(), node.getStartLinePos()),
    // structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
  } satisfies IndexSignatureAnalysis
  registerSymbolSymbolAnalysis(metadata, signature, options, registerSymbol)
  return {
    member: signature,
    dependencies: [...parameterTypeResult.dependencies, ...valueTypeResult.dependencies],
    reservedNames: [...parameterTypeResult.reservedNames, ...valueTypeResult.reservedNames],
  }
}
