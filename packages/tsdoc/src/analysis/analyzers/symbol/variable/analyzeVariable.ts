import { withOptional } from '@gyomu/schema'
import { SyntaxKind } from 'ts-morph'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeEffectSchema, getSupportedEffectSchemaType } from '../analyzeEffectSchema.js'
import {
  analyzeFunction,
  getFunctionSignature,
  isFunctionLikeInitializer,
} from './analyzeFunction.js'
import type { GetSignatureIdArg, TagAnalysisArg } from '../../types.js'
import type { SymbolAnalysis, TypeAnalysis } from '@gyomu/schema/typescript'
import type { VariableDeclaration } from 'ts-morph'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

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
    symbolId: variableName,
    signatureId: prepared.signature.id,
  }

  const effectSchemaSupportType = getSupportedEffectSchemaType(initializer)
  const typeAnalysis: TypeAnalysis | undefined =
    effectSchemaSupportType == undefined
      ? { text: variableName, source: 'typescript' }
      : analyzeEffectSchema(effectSchemaSupportType, {
          name: '',
          ownerSymbolId: prepared.id,
          ownerSymbolIdentity: identity,
          memberPath: [],
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

    ...withOptional({
      type: typeAnalysis,
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
