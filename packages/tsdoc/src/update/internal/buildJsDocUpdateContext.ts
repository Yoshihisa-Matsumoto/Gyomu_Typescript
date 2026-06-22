import { defaultComplexityStrategy, modeResolver } from '@gyomu/ai-compiler/jsdoc-update'
import { withOptional } from '@gyomu/schema'
import { UpdateError } from '../error/UpdateError.js'
import { computeComplexityScore } from '../../evaluation/complexity/computeComplexityScore.js'
import { buildContextEntry } from './buildContextEntry.js'
import { buildExistingJsDoc } from './buildExistingJsDoc.js'
import { buildSchemaStructureNode } from './buildSchemaStructureNode.js'
import type { ComplexityMetrics } from '../../evaluation/complexity/ComplexityMetrics.js'
import type { TsDocFileContext, TsDocSymbolContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'
import type { SymbolId } from '../../analysis/types.js'
import type { EffectSignals } from '@gyomu/schema/typescript'

export const buildJsDocUpdateContext = (
  projectName: string,
  fileResult: FileAnalysisResult,
  mapComplexity: Map<SymbolId, ComplexityMetrics>,
): TsDocFileContext => {
  const sourceFilePath = fileResult.analysis.path
  const fileContext: TsDocFileContext = {
    project: {
      name: projectName,
    },
    source: {
      relativePath: sourceFilePath,
    },
    symbols: [],
  }

  const results: Array<TsDocSymbolContext> = fileContext.symbols
  for (const exportInfo of fileResult.analysis.exports) {
    const symbol = exportInfo.symbol
    if (symbol.signature.isOverloadImplementation) continue
    const jsDocAnalysis = symbol.jsDoc
    const hasJsDoc = symbol.jsDoc != null && symbol.jsDoc.exists
    const parsedJsDoc = fileResult.metadata.parsedJsDocs.get(symbol.id)
    const targetComplexity = mapComplexity.get(symbol.id)
    if (!targetComplexity)
      throw new UpdateError({
        cause: undefined,
        filePath: fileResult.analysis.path,
        message: 'Complexity metrix not found',
        phase: 'context-build',
        symbolId: symbol.id,
        details: mapComplexity.keys().toArray(),
      })
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
          complexityScore: computeComplexityScore(targetComplexity),
        },
      },
      defaultComplexityStrategy,
    )
    // console.dir(symbol.members, { depth: null })
    const children = symbol.members
      // .filter((m) => m.documentable)
      .map((m) => buildContextEntry(fileResult, m))

    let effectSignals: Pick<EffectSignals, 'success' | 'error' | 'requirements'> | undefined =
      undefined

    if (symbol.type?.effect)
      effectSignals = {
        success: symbol.type.effect.success,
        error: symbol.type.effect.error,
        requirements: symbol.type.effect.requirements,
      }
    else if (symbol.signature.returnType?.effect) {
      effectSignals = {
        success: symbol.signature.returnType.effect.success,
        error: symbol.signature.returnType.effect.error,
        requirements: symbol.signature.returnType.effect.requirements,
      }
    }

    const context = {
      target: symbol.identity,
      symbol: {
        name: symbol.identity.symbolId,
        kind: symbol.kind,
      },

      code: {
        snippet: symbol.snippet,
      },
      ...withOptional({ existingJsDoc: buildExistingJsDoc(jsDocAnalysis, parsedJsDoc) }),
      effectSignals,
      relatedSymbols: [],
      children,
    } as TsDocSymbolContext
    results.push(context)
    // console.log({ target: context.target, mode })
    if (mode === 'light') {
      // const lightContext = context as LightJsDocContext
      // lightContext.options = {
      //   preserveStyle: true,
      // }
      // results.push(lightContext)
    } else {
      // const deepContext = context as DeepJsDocContext
      // deepContext.options = {
      //   requireHighQuality: true,
      //   allowRewrite: true,
      // }
      if (symbol.type?.source == 'effect-schema' && symbol.type.structure) {
        context.analysis = {
          ...withOptional({
            schemaStructure: buildSchemaStructureNode(
              symbol.type.structure,
              symbol.identity.symbolId,
            ),
          }),

          paramSemantics: [],
          protectedRegions: [],
          sideEffects: [],
        }
      }
    }
  }
  return fileContext
}
