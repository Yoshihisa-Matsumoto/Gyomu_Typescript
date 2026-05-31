// import { extractJsDoc } from '../extract/extractJsDoc.js'
// import type { ModuleDeclaration } from 'ts-morph'
// import type { SymbolAnalysis } from '../symbol/SymbolAnalysis.js'
// import type { AnalysisOptions } from '../AnalysisOption.js'

// export const analyzeModuleDeclaration = (args: {
//   declaration: ModuleDeclaration
//   name?: string
//   options?: AnalysisOptions
// }) => ({
//   symbol: {
//     kind: 'namespace',
//     location: {
//       startLine: args.declaration.getStartLineNumber(),
//       endLine: args.declaration.getEndLineNumber(),
//     },
//     name: args.name ?? args.declaration.getName(),
//     jsDoc: extractJsDoc(args.declaration, args.options),
//   } as SymbolAnalysis,
//   isDefault: args.declaration.isDefaultExport(),
// })
