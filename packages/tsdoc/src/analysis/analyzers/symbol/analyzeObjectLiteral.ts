// import type { ObjectLiteralExpression } from 'ts-morph'
// import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
// import type {
//   MemberIdentityMemberPath,
//   MemberIdentityOwnerSymbolId,
// } from '../../symbol/MemberAnalysis.js'
// import type { ProjectRelativePath } from '../../types.js'
// import type { TypeStructureAnalysis } from '../../symbol/SymbolModel.js'

// export const analyzeObjectLiteralTypeStructure = (args: {
//   sourcePath: ProjectRelativePath
//   metadata: FileAnalysisMetadata
//   ownerSymbolId: MemberIdentityOwnerSymbolId
//   memberPath: MemberIdentityMemberPath
//   initializer: ObjectLiteralExpression
//   rawText?: string | undefined
// }): TypeStructureAnalysis | undefined => {
//   const { sourcePath, metadata, ownerSymbolId, memberPath, initializer, rawText } = args
//   const properties = initializer.getProperties()
//   return {
//     kind: 'object',
//     members: properties.map((property) => {
//       property.is
//     }),
//   }
// }

// const analyzeObjectLiteralElementLike
