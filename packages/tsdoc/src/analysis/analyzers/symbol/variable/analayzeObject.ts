// import { Node, SyntaxKind } from 'ts-morph'
// import { withOptional } from '@gyomu/schema'
// import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
// import { analyzeObjectMembers } from '../analyzeObjectMembers.js'
// import type { ProjectRelativePath } from '../../../types.js'
// import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'
// import type { AnalysisOptions } from '../../../AnalysisOption.js'
// import type { SymbolPreparation } from '../prepareSymbolAnalysis.js'
// import type { SymbolAnalysis } from '../../../symbol/SymbolAnalysis.js'

// import type { Expression, ObjectLiteralExpression, VariableDeclaration } from 'ts-morph'
// import { analyzeType } from '../analyzeType.js'

// export const isObjectInitializer = (
//   node: Expression | undefined,
// ): node is ObjectLiteralExpression => Node.isObjectLiteralExpression(node)

// export const analyzeObject = (
//   args: {
//     declaration: VariableDeclaration
//     sourceRelativePath: ProjectRelativePath
//     metadata: FileAnalysisMetadata
//     name?: string
//     options?: AnalysisOptions
//   },
//   prepared: SymbolPreparation,
//   initializer: ObjectLiteralExpression,
// ) => {
//   const name = args.name ?? args.declaration.getName()
//   const { sourceRelativePath, declaration, metadata } = args
//   const symbol = {
//     id: prepared.id,
//     signature: prepared.signature,
//     snippet: prepared.snippet,
//     kind: 'const',
//     location: {
//       startLine: args.declaration.getStartLineNumber(),
//       endLine: args.declaration.getEndLineNumber(),
//     },
//     type: analyzeType({
//       sourcePath: sourceRelativePath,
//       initializer,
//       node: undefined,
//       memberPath: [name],
//       metadata,
//       nodeName: [name],
//       ownerSymbolId: prepared.id,
//     }),
//     identity: {
//       symbolId: name,
//       signatureId: prepared.signature.id,
//     },
//     startOffset: args.declaration
//       .getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement)
//       .getStart(),
//     ...withOptional({
//       jsDoc: prepared.jsDoc,
//     }),
//     members: analyzeObjectMembers(
//       args.sourceRelativePath,
//       args.metadata,
//       args.declaration,
//       prepared.id,
//       [name],
//     ),
//   } satisfies SymbolAnalysis
//   registerSymbolSymbolAnalysis(prepared.id, args.metadata, symbol)

//   return {
//     symbol,
//     isDefault: args.declaration.isDefaultExport(),
//   }
// }
