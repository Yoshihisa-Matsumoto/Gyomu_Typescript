import type { ExportSummary } from '@gyomu/schema/concept'
import type { FileConceptInput } from '../context/FileConceptInput.js'

/**
 * Renders a file concept input into a string format containing the file path and its exported symbols.
 *
 * @param context The file concept input data containing path and exports.
 *
 * @returns The rendered string representation of the file concept input.
 */
export const renderFileConceptInput = (context: FileConceptInput): string => {
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
