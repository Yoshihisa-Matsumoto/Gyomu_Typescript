import { equalSymbolIdentity } from '@gyomu/schema/schemas/typescript'
import { renderTemplate } from './renderPrompt.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'

export const createAskPrompt = (args: {
  question: string
  analysis: FileAnalysisContext
}): string => {
  const template = `You are a code analysis assistant.

# Question:
{{question}}

# File Analysis:
{{analysis}}

Answer the question using the information above.`
  const analysisObject = {
    path: args.analysis.analysis.path,
    exports: args.analysis.analysis.exports
      .filter((e) => e.kind == 'local')
      .map((e) => {
        const symbol = args.analysis.analysis.symbols.find((s) =>
          equalSymbolIdentity(s.identity, e.identity),
        )
        if (!symbol) return undefined
        const parsedJsDoc = args.analysis.metadata.parsedJsDocs.get(symbol.id)
        return {
          name: e.exportedName,
          kind: symbol.kind,
          signature: symbol.signature,
          jsdocSummary: parsedJsDoc?.summary,
          jsdocParams: parsedJsDoc?.params.map((p) => ({
            name: p.name,
            description: p.description,
          })),
          jsdocReturns: parsedJsDoc?.returns?.description,
        }
      })
      .filter((exp) => !!exp),
  }
  const analysis = JSON.stringify(analysisObject)

  return renderTemplate(template, { question: args.question, analysis })
}
// function replacer(key, value) {
//   if (value instanceof Map) {
//     return Object.fromEntries(value)
//   } else {
//     return value
//   }
// }
