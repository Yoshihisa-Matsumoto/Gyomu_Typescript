import { defaultComplexityStrategy, modeResolver } from '@gyomu/ai-compiler/jsdoc-update'
import { withOptional } from '@gyomu/schema'
import type { ParsedJsDoc } from '../../analysis/jsdoc/ParsedJsDoc.js'
import type { ExistingJsDoc, JsDocUpdateContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'
import type { JsDocAnalysis } from '../../analysis/jsdoc/JsDocAnalysis.js'

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
    const context = {
      project: {
        name: projectName,
      },
      source: {
        relativePath: sourceFilePath,
      },
      mode: 'light',
      target: {
        signatureId: symbol.signature.id,
        symbolId: symbol.name,
      },
      symbol: {
        name: symbol.name,
        kind: symbol.kind,
      },
      code: {
        snippet: symbol.snippet,
      },
      ...withOptional({ existingJsDoc: buildExistingJsDoc(jsDocAnalysis, parsedJsDoc) }),
      relatedSymbols: [],
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

const buildExistingJsDoc = (
  jsDocAnalysis: JsDocAnalysis | undefined,
  parsedJsDoc: ParsedJsDoc | undefined,
): ExistingJsDoc | undefined => {
  if (!jsDocAnalysis || !parsedJsDoc) {
    return undefined
  } else {
    return {
      ...withOptional({ summary: parsedJsDoc.summary, returns: parsedJsDoc.returns?.description }),
      params: parsedJsDoc.params.map((p) => ({
        name: p.name,
        ...withOptional({
          type: p.type,
          description: p.description,
        }),
      })),
      tags: parsedJsDoc.tags
        .filter((f) => ['param', 'return'].includes(f.tagName) == false)
        .map((t) => ({
          tag: t.tagName,
          content: t.text ?? '',
        })),
    }
  }
}
