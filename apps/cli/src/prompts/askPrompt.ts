import { renderTemplate } from './renderPrompt.js'
import type { FileAnalysisResult } from '@gyomu/tsdoc'

export const createAskPrompt = (args: {
  question: string
  analysis: FileAnalysisResult
}): string => {
  const template = `You are a code analysis assistant.

# Question:
{{question}}

# File Analysis:
{{analysis}}

Answer the question using the information above.`
  const analysisObject = {
    path: args.analysis.analysis.path,
    exports: args.analysis.analysis.exports.map((e) => {
      const symbol = e.symbol
      const parsedJsDoc = args.analysis.metadata.parsedJsDocs.get(symbol.id)
      return {
        name: e.exportedName,
        kind: symbol.kind,
        signature: symbol.signature,
        jsdocSummary: parsedJsDoc?.summary,
        jsdocParams: parsedJsDoc?.params.map((p) => ({ name: p.name, description: p.description })),
        jsdocReturns: parsedJsDoc?.returns?.description,
      }
    }),
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
