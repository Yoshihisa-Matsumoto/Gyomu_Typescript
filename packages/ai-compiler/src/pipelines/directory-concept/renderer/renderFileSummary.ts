import type { ExportSummary, FileSummary, ReExportSummary } from '@gyomu/schema/concept'

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
