import { SyntaxKind } from 'ts-morph'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeEffectSchema, getSupportedEffectSchemaType } from '../analyzeEffectSchema.js'
import {
  analyzeFunction,
  getFunctionSignature,
  isFunctionLikeInitializer,
} from './analyzeFunction.js'
import type { Builder } from '@gyomu/schema/entity'
import type { SymbolAnalysis } from '@gyomu/schema/typescript'
import type { GetSignatureIdArg, MemberAnalysisResult, TagAnalysisArg } from '../../types.js'
import type { VariableDeclaration } from 'ts-morph'
import type { SymbolIdentity, TypeAnalysis } from '@gyomu/schema/schemas/typescript'

export const analyzeVariable = (args: TagAnalysisArg<VariableDeclaration>) => {
  const statement = args.declaration.getVariableStatement()
  const variableName = args.declaration.getName()
  const {
    declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    options,
  } = args

  const prepared = prepareSymbolAnalysis(
    {
      declaration,
      sourceRelativePath,
      metadata,
      memberPath,
      sourceFullText,
      imported,
      options,
      nodeName: variableName,
      reservedNames: [],
    },
    getSignatureId,
    statement,
  )

  const initializer = args.declaration.getInitializer()
  // let type: TypeAnalysis
  if (isFunctionLikeInitializer(initializer)) {
    return analyzeFunction(args, prepared, initializer)
  }
  const identity: SymbolIdentity = {
    symbolId: SymbolId(variableName),
    signatureId: prepared.signature.id,
  }

  const effectSchemaSupportType = getSupportedEffectSchemaType(initializer)
  const typeAnalysisResult: MemberAnalysisResult<TypeAnalysis> | undefined =
    effectSchemaSupportType == undefined
      ? { member: { text: variableName, source: 'typescript' }, dependencies: [] }
      : analyzeEffectSchema(effectSchemaSupportType, {
          name: '',
          ownerSymbolId: prepared.id,
          ownerSymbolIdentity: identity,
          memberPath: [],
          imported,
        })
  // if (isObjectInitializer(initializer)) {
  //   return analyzeObject(args, prepared, initializer)
  // }

  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'const',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },

    identity,
    startOffset: args.declaration
      .getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement)
      .getStart(),

    type: typeAnalysisResult?.member,
    jsDoc: prepared.jsDoc,
    parsedJsDoc: prepared.parsedJsDoc,
    members: [],

    declarationOrder: args.declarationOrder,
    dependencyCandidates: typeAnalysisResult?.dependencies ?? [],
  } satisfies Builder<SymbolAnalysis>
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

const getSignatureId = (args: GetSignatureIdArg<VariableDeclaration>) => {
  const { declaration } = args
  const initializer = declaration.getInitializer()
  if (isFunctionLikeInitializer(initializer)) {
    return getFunctionSignature(
      args,
      initializer,

      0,
    )
  }
  return { id: SignatureId('variable'), parameters: [] }
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
