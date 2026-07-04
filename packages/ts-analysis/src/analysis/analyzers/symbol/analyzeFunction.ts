import { Node } from 'ts-morph'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { analyzeType } from './analyzeType.js'
import { computeIndent } from './computeIndent.js'
import { analyzeFunctionBody, analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzeParameter } from './analyzeParameter.js'
import { analyzeGenericsParameters } from './analyzeGenericsParameters.js'
import type { MemberAnalysis, SignatureAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { FunctionDeclaration } from 'ts-morph'
import type {
  ChildAnalysisArg,
  GetSignatureIdArg,
  MemberAnalysisResult,
  TagAnalysisArg,
} from '../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'

export const analyzeFunction = (args: TagAnalysisArg<FunctionDeclaration>) => {
  const { sourceRelativePath, sourceFullText, imported, options, metadata, declaration } = args
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
  })

  const returnTypeResult = analyzeType(
    {
      node: declaration.getReturnTypeNode()!,
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
    },
    ['$return'],
    undefined,
  )
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
    },
    {
      isStatic: false,
      visibility: 'public',
      name: typeName,
      jsDocableNode: declaration,
      returnType: returnTypeResult,
    },
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
      ...(returnTypeResult?.dependencies ?? []),
    ],
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
  })
  const returnTypeResult = analyzeType(
    {
      node: declaration.getReturnTypeNode()!,
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
    },
    ['$return'],
    undefined,
  )
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
    returnType: returnTypeResult?.member,
    dependencyCandidates: [
      ...(returnTypeResult?.dependencies ?? []),
      ...genericsResult.dependencies,
    ],
  }
}

const analyzeFunctionMembers = (
  args: ChildAnalysisArg<FunctionDeclaration>,
): MemberAnalysisResult<Array<MemberAnalysis>> => {
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
    })
  })

  return {
    member: parameters.map((p) => p.member),
    dependencies: parameters.map((p) => p.dependencies).flat(),
  }
}
