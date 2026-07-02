import { defaultComplexityStrategy, modeResolver } from '@gyomu/ai-compiler/jsdoc-update'
import { withOptional } from '@gyomu/schema'
import { equalSymbolIdentity } from '@gyomu/schema/schemas/typescript'
import { equalSummaryDependency } from '@gyomu/schema/typescript'
import { UpdateError } from '../error/UpdateError.js'
import { computeComplexityScore } from '../../evaluation/complexity/computeComplexityScore.js'
import { buildContextEntry } from './buildContextEntry.js'
import { buildExistingJsDoc } from './buildExistingJsDoc.js'
import { buildSchemaStructureNode } from './buildSchemaStructureNode.js'
import type {
  DependencyCandidate,
  EffectSignals,
  MemberIdentityMemberPath,
  SummaryDependency,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { ComplexityMetrics } from '../../evaluation/complexity/ComplexityMetrics.js'
import type { TsDocFileContext, TsDocSymbolContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'

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
  for (const exportInfo of fileResult.analysis.exports.filter((e) => e.kind == 'local')) {
    const symbol = fileResult.analysis.symbols.find((s) =>
      equalSymbolIdentity(s.identity, exportInfo.identity),
    )
    if (!symbol) {
      throw new UpdateError({
        cause: undefined,
        filePath: fileResult.analysis.path,
        message: 'Symbol Not Found',
        phase: 'context-build',
        details: exportInfo.identity,
      })
    }
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
      .map((m) => buildContextEntry(fileResult, m, symbol))

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

    const summaryDependencies = filterImportantDependencies(
      symbol.identity.symbolId,
      symbol.dependencyCandidates,
    )
    const context: TsDocSymbolContext = {
      target: symbol.identity,
      symbol: {
        name: symbol.identity.symbolId,
        kind: symbol.kind,
      },

      code: {
        snippet: symbol.snippet,
      },
      existingJsDoc: buildExistingJsDoc(jsDocAnalysis, parsedJsDoc),
      effectSignals,
      relatedSymbols: [],
      children,
      analysis: undefined,
      dependencies:
        summaryDependencies.length > 0 ? { candidates: summaryDependencies } : undefined,
    } satisfies TsDocSymbolContext
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
          sideEffects: [],
        }
      }
    }
  }
  return fileContext
}

const filterImportantDependencies = (
  name: string,
  depedencies: ReadonlyArray<DependencyCandidate>,
): Array<SummaryDependency> => {
  const summaries = new Array<SummaryDependency>()

  depedencies.forEach((dependency) => {
    const summary = DependencyCandidate2SummaryDependency(name, dependency)
    if (summary) {
      const targetSummary = summaries.find((s) => equalSummaryDependency(s, summary))
      if (!targetSummary) summaries.push(summary)
    }
  })

  return summaries
}

const DependencyCandidate2SummaryDependency = (
  name: string,
  dependency: DependencyCandidate,
): SummaryDependency | undefined => {
  const reason = convertMemberPathIntoReason(name, dependency.source.memberPath)
  if (!reason) return undefined
  return {
    reason,
    target: dependency.target,
  }
}
type SummaryDependencyReason = SummaryDependency['reason']
const convertMemberPathIntoReason = (
  name: string,
  memberPath: MemberIdentityMemberPath,
): SummaryDependencyReason | undefined => {
  if (memberPath.length == 0) return undefined
  const index = memberPath.findIndex((v) => v == name)
  const targetIndex = index == -1 ? 0 : index + 1
  const firstKey = memberPath[targetIndex]
  switch (firstKey) {
    case '$return':
      return 'return'
    case '$extend':
      return 'extends'
    case '$implement':
      return 'implements'
    case '$generics':
      return 'generics'
    case '$member':
      return 'member'
    case '$parameters':
      return 'parameter'
    case '$body':
      return 'body'
    default:
      return undefined
  }
}
