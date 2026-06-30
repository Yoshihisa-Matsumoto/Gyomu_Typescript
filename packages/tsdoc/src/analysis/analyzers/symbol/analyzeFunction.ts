import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { analyzeType } from './analyzeType.js'
import { computeIndent } from './computeIndent.js'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzeParameter } from './analyzeParameter.js'
import type { FunctionDeclaration } from 'ts-morph'
import type { MemberAnalysis, SignatureAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { ChildAnalysisArg, GetSignatureIdArg, TagAnalysisArg } from '../types.js'
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
    },
    getFunctionSignatureId,
  )
  const identity: SymbolIdentity = {
    symbolId: typeName,
    signatureId: prepared.signature.id,
  }
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
      ...withOptional({ effect: detectEffectSignals(typeName) }),
    },
    identity,
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc, parsedJsDoc: prepared.parsedJsDoc }),
    members: analyzeFunctionMembers({
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
  const returnType = analyzeType(
    {
      node: declaration.getReturnTypeNode()!,
      sourceRelativePath,
      metadata,
      ownerSymbolId: symbolId,
      ownerSymbolIdentity: {
        symbolId: nodeName,
        signatureId: symbolId,
      },
      memberPath,
      sourceFullText,
      declarationOrder: 0,
      imported,
      options,
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
    id: symbolId,
    parameters: [],
    overloadCount: declaration.getOverloads().length,
    isOverloadImplementation,
    ...withOptional({ returnType }),
  }
}

const analyzeFunctionMembers = (
  args: ChildAnalysisArg<FunctionDeclaration>,
): Array<MemberAnalysis> => {
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
  } = args
  return node.getParameters().flatMap((member, index) => {
    const typeNode = member.getTypeNode()
    if (Node.isFunctionTypeNode(typeNode)) {
      return [
        analyzeFunctionMember(
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
          },
          {
            isStatic: undefined,
            visibility: undefined,
            name: member.getName(),
            jsDocableNode: node,
          },
        ),
      ] as Array<MemberAnalysis>
    }
    // console.log(`PropMember, ${index}`)
    return [
      analyzeParameter({
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
      }),
    ]
    // if (Node.isPropertySignature(member)) {
    //   const typeNode = member.getTypeNode()

    // }

    // if (Node.isMethodSignature(member)) {
    //   return [
    //     analyzeFunctionMember({
    //       sourcePath,
    //       metadata,
    //       node: member,
    //       ownerSymbolId,
    //       ownerSymbolIdentity,
    //       memberPath,
    //       name: member.getName(),
    //       jsDocableNode: node,
    //       sourceFullText,
    //       declarationOrder: index,
    //     }),
    //   ] as Array<MemberAnalysis>
    // }

    // return [] as Array<MemberAnalysis>
  })
}
