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
import type {
  MemberAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  SignatureAnalysis,
} from '@gyomu/schema/typescript'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type { ProjectRelativePath } from '../../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'

export const analyzeFunctionDeclaration = (args: JSDocableTagAnalysisArg<FunctionDeclaration>) => {
  const typeName = args.name ?? args.declaration.getName() ?? ''
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    [],
    getFunctionSignatureId,
    typeName,
    args.sourceFullText,
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
      ...withOptional({ effect: detectEffectSignals(typeName) }),
    },
    identity,
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc }),
    members: analyzeFunctionMembers(
      args.sourceRelativePath,
      args.metadata,
      args.declaration,
      prepared.id,
      identity,
      [],
      args.sourceFullText,
    ),
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
const normalizeTypeText = (text: string): string => text.replace(/import\([^)]*\)\./g, '')

const getFunctionSignatureId = (
  declaration: FunctionDeclaration,
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  memberPath: MemberIdentityMemberPath,
  nodeName: string,
  sourceFullText: string,
): SignatureAnalysis => {
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
  const returnType = analyzeType({
    node: declaration.getReturnTypeNode()!,
    initializer: undefined,
    sourcePath,
    metadata,
    ownerSymbolId: symbolId,
    ownerSymbolIdentity: {
      symbolId: nodeName,
      signatureId: symbolId,
    },
    memberPath,
    nodeName: ['$return'],
    sourceFullText,
    declarationOrder: 0,
  })
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
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  node: FunctionDeclaration,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  sourceFullText: string,
): Array<MemberAnalysis> => {
  return node.getParameters().flatMap((member, index) => {
    const typeNode = member.getTypeNode()
    if (Node.isFunctionTypeNode(typeNode)) {
      return [
        analyzeFunctionMember({
          sourcePath,
          metadata,
          name: member.getName(),
          node: typeNode,
          jsDocableNode: node,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          sourceFullText,
          declarationOrder: index,
        }),
      ] as Array<MemberAnalysis>
    }
    // console.log(`PropMember, ${index}`)
    return [
      analyzeParameter({
        sourceRelativePath: sourcePath,
        metadata,
        node: member,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        sourceFullText,
        declarationOrder: index,
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
