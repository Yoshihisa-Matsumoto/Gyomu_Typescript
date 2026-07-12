import type { ExportSummary } from '@gyomu/schema/concept'
import type { FileConceptInput } from '../context/FileConceptInput.js'

export const renderFileSummary = (context: FileConceptInput): string => {
  return `File path:
${context.path}

Exported symbols:
${context.exports.map((summary) => buildExportSymbolInput(summary)).join('\n\n')}
`
}

const buildExportSymbolInput = (symbol: ExportSummary): string => {
  return `- ${symbol.symbol} (${symbol.kind})
  Summary:
  ${symbol.summary}`
}
