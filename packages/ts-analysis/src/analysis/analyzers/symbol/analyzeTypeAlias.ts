// import { Node } from 'ts-morph'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
// import { detectEffectSignals } from './analyzeEffectType.js'
// import { analyzeObjectMembers } from './analyzeObjectMembers.js'
import { computeIndent } from './computeIndent.js'
import { analyzeType } from './type/analyzeType.js'
import { analyzeGenericsParameters } from './analyzeGenericsParameters.js'
import type { TypeAliasDeclaration, TypeNode } from 'ts-morph'
import type { ChildAnalysisArg, TagAnalysisArg } from '../types.js'
import type { SymbolAnalysis, SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeTypeAlias = (args: TagAnalysisArg<TypeAliasDeclaration>) => {
  const {
    declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    options,
  } = args

  const typeName = args.declaration.getName()
  const typeOfType = args.declaration.getTypeNode()
  const prepared = prepareSymbolAnalysis(
    {
      declaration,
      sourceRelativePath,
      metadata,
      memberPath,
      sourceFullText,
      imported,
      options,
      nodeName: typeName,
      reservedNames: [],
    },
    getSignatureId,
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
  })
  const typeAnalysisArg: ChildAnalysisArg<TypeNode | undefined> = {
    ...args,
    node: typeOfType,
    ownerSymbolId: prepared.id,
    ownerSymbolIdentity: identity,
    memberPath: [...args.memberPath],
    reservedNames: [],
  }
  const typeResult = analyzeType(typeAnalysisArg, [])
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'type',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    type: typeResult.member,
    identity,
    startOffset: args.declaration.getStart(),
    jsDoc: prepared.jsDoc,
    parsedJsDoc: prepared.parsedJsDoc,
    members: [],
    declarationOrder: args.declarationOrder,
    dependencyCandidates: [...genericsResult.dependencies, ...typeResult.dependencies],
    docIndent: computeIndent(
      args.sourceFullText,
      args.declaration.getStart(),
      args.declaration.getStartLinePos(),
    ),
  } satisfies SymbolAnalysis
  // if (Node.isTypeLiteral(typeOfType)) {
  //   const membersResult = analyzeObjectMembers({
  //     sourceRelativePath,
  //     metadata,
  //     node: declaration,
  //     ownerSymbolId: prepared.id,
  //     ownerSymbolIdentity: identity,
  //     memberPath: [],
  //     sourceFullText,
  //     imported,
  //     options,
  //     declarationOrder: 0,
  //     reservedNames: genericsResult.parameters,
  //   })

  //   symbol = {
  //     id: prepared.id,
  //     signature: prepared.signature,
  //     snippet: prepared.snippet,
  //     kind: 'type',
  //     location: {
  //       startLine: args.declaration.getStartLineNumber(),
  //       endLine: args.declaration.getEndLineNumber(),
  //     },
  //     type: {
  //       text: typeName,
  //       source: 'typescript',
  //       effect: detectEffectSignals(typeName),
  //     },
  //     identity,
  //     startOffset: args.declaration.getStart(),
  //     jsDoc: prepared.jsDoc,
  //     parsedJsDoc: prepared.parsedJsDoc,
  //     members: membersResult.member,
  //     declarationOrder: args.declarationOrder,
  //     dependencyCandidates: [...genericsResult.dependencies, ...membersResult.dependencies],
  //     docIndent: computeIndent(
  //       args.sourceFullText,
  //       args.declaration.getStart(),
  //       args.declaration.getStartLinePos(),
  //     ),
  //   } satisfies SymbolAnalysis
  // } else if (Node.isTypeNode(typeOfType)) {
  //   const typeAnalysisArg: ChildAnalysisArg<TypeNode> = {
  //     ...args,
  //     node: typeOfType,
  //     ownerSymbolId: prepared.id,
  //     ownerSymbolIdentity: identity,
  //     memberPath: [...args.memberPath, '$type'],
  //     reservedNames: [],
  //   }
  //   const typeResult = analyzeType(typeAnalysisArg, [])
  //   symbol = {
  //     id: prepared.id,
  //     signature: prepared.signature,
  //     snippet: prepared.snippet,
  //     kind: 'type',
  //     location: {
  //       startLine: args.declaration.getStartLineNumber(),
  //       endLine: args.declaration.getEndLineNumber(),
  //     },
  //     type: typeResult.member,
  //     identity,
  //     startOffset: args.declaration.getStart(),
  //     jsDoc: prepared.jsDoc,
  //     parsedJsDoc: prepared.parsedJsDoc,
  //     members: [],
  //     declarationOrder: args.declarationOrder,
  //     dependencyCandidates: [...genericsResult.dependencies, ...typeResult.dependencies],
  //     docIndent: computeIndent(
  //       args.sourceFullText,
  //       args.declaration.getStart(),
  //       args.declaration.getStartLinePos(),
  //     ),
  //   } satisfies SymbolAnalysis
  // } else {
  //   symbol = {
  //     id: prepared.id,
  //     signature: prepared.signature,
  //     snippet: prepared.snippet,
  //     kind: 'type',
  //     location: {
  //       startLine: args.declaration.getStartLineNumber(),
  //       endLine: args.declaration.getEndLineNumber(),
  //     },
  //     type: {
  //       text: typeName,
  //       source: 'typescript',
  //       effect: detectEffectSignals(typeName),
  //     },
  //     identity,
  //     startOffset: args.declaration.getStart(),
  //     jsDoc: prepared.jsDoc,
  //     parsedJsDoc: prepared.parsedJsDoc,
  //     members: [],
  //     declarationOrder: args.declarationOrder,
  //     dependencyCandidates: [...genericsResult.dependencies],
  //     docIndent: computeIndent(
  //       args.sourceFullText,
  //       args.declaration.getStart(),
  //       args.declaration.getStartLinePos(),
  //     ),
  //   } satisfies SymbolAnalysis
  // }
  registerSymbolSymbolAnalysis(args.metadata, symbol, options)
  return {
    symbol: symbol,
    isDefault: args.declaration.isDefaultExport(),
    exportedName: args.declaration.isDefaultExport() ? '$default' : args.declaration.getName(),
    isExported: args.declaration.isExported(),
  }
}

const getSignatureId = () => {
  return { id: SignatureId('type'), parameters: [], dependencyCandidates: [] }
}
