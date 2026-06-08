import { withOptional } from '@gyomu/schema'
import { SyntaxKind } from 'ts-morph'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import {
  analyzeFunction,
  getFunctionSignature,
  isFunctionLikeInitializer,
} from './analyzeFunction.js'
import type { MemberIdentityMemberPath } from '../../../symbol/MemberAnalysis.js'
import type { VariableDeclaration } from 'ts-morph'
import type { ProjectRelativePath } from '../../../types.js'
import type { SymbolAnalysis } from '../../../symbol/SymbolAnalysis.js'
import type { AnalysisOptions } from '../../../AnalysisOption.js'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'
import type { TypeAnalysis } from '../../../symbol/SymbolModel.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeVariableDeclaration = (args: {
  declaration: VariableDeclaration
  sourceRelativePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  memberPath: MemberIdentityMemberPath
  name?: string
  options?: AnalysisOptions
  sourceFullText: string
}) => {
  const statement = args.declaration.getVariableStatement()
  const name = args.name ?? args.declaration.getName()
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    args.memberPath,
    getSignatureId,
    name,
    args.sourceFullText,
    statement,
  )

  const initializer = args.declaration.getInitializer()
  let type: TypeAnalysis
  if (isFunctionLikeInitializer(initializer)) {
    return analyzeFunction(args, prepared, initializer)
  }
  // if (isObjectInitializer(initializer)) {
  //   return analyzeObject(args, prepared, initializer)
  // }
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
    type: { text: name },
    identity,
    startOffset: args.declaration
      .getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement)
      .getStart(),
    ...withOptional({
      jsDoc: prepared.jsDoc,
      members: [],
    }),
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

const getSignatureId = (
  declaration: VariableDeclaration,
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  memberPath: MemberIdentityMemberPath,
  nodeName: string,
  sourceFullText: string,
) => {
  const initializer = declaration.getInitializer()
  if (isFunctionLikeInitializer(initializer)) {
    return getFunctionSignature(
      declaration,
      initializer,
      sourcePath,
      metadata,
      memberPath,
      nodeName,
      sourceFullText,
    )
  }
  return { id: 'variable', parameters: [] }
}

// const analyzeVariableMembers = (declaration: VariableDeclaration): Array<MemberAnalysis> => {
//   const typeNode = declaration.getTypeNode()
//   if (Node.isTypeLiteral(typeNode)) {
//     return typeNode.getMembers().flatMap((member) => {
//       if (Node.isMethodSignature(member)) {
//         return [analyzeMethodMember(member)]
//       }

//       if (Node.isPropertySignature(member)) {
//         const typeNode = member.getTypeNode()
//         if (Node.isFunctionTypeNode(typeNode)) {
//           return [analyzeFunctionMember(member.getName(), typeNode)]
//         }
//         return [analyzePropertyMember(member)]
//       }

//       return [] as Array<MemberAnalysis>
//     })
//   }
//   return [] as Array<MemberAnalysis>
// }
