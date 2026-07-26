import type { ExportSummary, FileSummary, ReExportSummary } from '@gyomu/schema/concept'

/**
 * Renders a text summary for a given file including its path and a list of exported and re-exported symbols.
 *
 * @param context The file information object containing path, exports, and re-exports.
 *
 * @returns A formatted string representation of the file summary.
 */
export const renderFileSummary = (context: FileSummary): string => {
  return `File path:
${context.path}

Exported symbols:
${[...context.exports.map((summary) => buildExportSymbolInput(summary)), ...context.reExports.map((summary) => buildReExportSymbolInput(summary))].join('\n\n')}
`
}

const buildExportSymbolInput = (symbol: ExportSummary): string => {
  return `- ${symbol.symbol} (${symbol.kind})
  Summary:
  ${symbol.summary}`
}

const buildReExportSymbolInput = (symbol: ReExportSummary): string => {
  return `- export ${symbol.exportAll ? '*' : symbol.symbol} from "${symbol.module}"`
}
