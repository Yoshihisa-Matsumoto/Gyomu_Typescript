import { defaultComplexityStrategy, modeResolver } from '@gyomu/ai-compiler/jsdoc-update'
import { withOptional } from '@gyomu/schema'
import { buildContextEntry } from './buildContextEntry.js'
import { buildExistingJsDoc } from './buildExistingJsDoc.js'
import type { JsDocUpdateContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'

export const buildJsDocUpdateContext = (
  projectName: string,
  fileResult: FileAnalysisResult,
): Array<JsDocUpdateContext> => {
  const sourceFilePath = fileResult.analysis.path
  const results: Array<JsDocUpdateContext> = []
  for (const exportInfo of fileResult.analysis.exports) {
    const symbol = exportInfo.symbol
    if (symbol.signature.isOverloadImplementation) continue
    const jsDocAnalysis = symbol.jsDoc
    const hasJsDoc = symbol.jsDoc != null && symbol.jsDoc.exists
    const parsedJsDoc = fileResult.metadata.parsedJsDocs.get(symbol.id)
    const mode = modeResolver(
      {
        file: {
          defaultMode: 'light',
          hasGeneratedJsDoc: false,
          stabilityScore: 0.5,
        },
        symbol: {
          exported: true,
          publicApi: false,
          hasJsDoc,
          humanEdited: symbol.jsDoc != null && symbol.jsDoc.hasHumanEditedSections,
          complexityScore: symbol.complexity != null ? 1 : 0,
        },
      },
      defaultComplexityStrategy,
    )
    const children = symbol.members
      .filter((m) => m.documentable)
      .map((m) => buildContextEntry(fileResult, m))
    const context = {
      project: {
        name: projectName,
      },
      source: {
        relativePath: sourceFilePath,
      },
      mode: 'light',
      target: symbol.identity,
      symbol: {
        name: symbol.identity.symbolId,
        kind: symbol.kind,
      },
      code: {
        snippet: symbol.snippet,
      },
      ...withOptional({ existingJsDoc: buildExistingJsDoc(jsDocAnalysis, parsedJsDoc) }),
      relatedSymbols: [],
      children,
      options: {
        preserveStyle: true,
      },
    } as JsDocUpdateContext

    if (mode === 'light') {
      context.options = {
        preserveStyle: true,
      }
    } else {
      context.mode = 'deep'
      context.options = {
        requireHighQuality: true,
        allowRewrite: true,
      }
    }
    results.push(context)
  }
  return results
}
