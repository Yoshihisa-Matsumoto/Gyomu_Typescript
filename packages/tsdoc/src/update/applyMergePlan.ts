import { Effect } from 'effect'
import { withOptional } from '@gyomu/schema'
import { UpdateError } from './error/UpdateError.js'
import { mergeTags } from './merge/mergeTags.js'
import { mergeSummary } from './merge/mergeSummary.js'
import { mergeReturns } from './merge/mergeReturns.js'
import { mergeParams } from './merge/mergeParams.js'
import type { UpdatedJsDoc } from './jsdoc/UpdatedJsDoc.js'
import type { MergePlan } from './jsdoc/MergePlan.js'
import type { FileAnalysisResult } from '../analysis/file/FileAnalysisResult.js'
import type { UpdatedSymbolJsDoc } from './jsdoc/UpdatedSymbolJsDoc.js'

export const applyMergePlan = (
  fileResult: FileAnalysisResult,
  plan: MergePlan,
): Effect.Effect<UpdatedJsDoc, UpdateError> => {
  return Effect.gen(function* () {
    const targetExport = fileResult.analysis.exports.find((exp) => {
      const identity = exp.symbol.identity
      return (
        identity.signatureId == plan.target.signatureId && identity.symbolId == plan.target.symbolId
      )
    })
    if (!targetExport)
      return yield* Effect.fail(
        new UpdateError({
          filePath: fileResult.analysis.path,
          message: 'symbol not found',
          details: plan.target,
          cause: undefined,
          phase: 'apply-merge',
        }),
      )
    const targetSymbol = targetExport.symbol
    const existingJsDoc = fileResult.metadata.parsedJsDocs.get(targetSymbol.id)
    const params = yield* mergeParams(fileResult.analysis.path, plan.params, existingJsDoc)
    const tags = yield* mergeTags(fileResult.analysis.path, plan.tags, existingJsDoc)
    const updatedJsDoc: UpdatedJsDoc = {
      examples: existingJsDoc?.examples ?? [],
      humanEditSignals: existingJsDoc?.humanEditSignals ?? [],
      protectedRegions: existingJsDoc?.protectedRegions ?? [],

      templates: existingJsDoc?.templates ?? [],
      throws: existingJsDoc?.throws ?? [],
      ...withOptional({
        generator: existingJsDoc?.generator,
        deprecated: existingJsDoc?.deprecated,
        remarks: existingJsDoc?.remarks,

        summary: mergeSummary(plan.summary, existingJsDoc),
        returns: mergeReturns(plan.returns, existingJsDoc),
      }),

      params,
      tags,
      startOffset: existingJsDoc?.startOffset ?? targetSymbol.startOffset,
      endOffset: existingJsDoc?.endOffset ?? targetSymbol.startOffset,
    }

    return yield* Effect.succeed(updatedJsDoc)
  })
}

export const applyMergePlans = (
  fileResult: FileAnalysisResult,
  plans: ReadonlyArray<MergePlan>,
): Effect.Effect<ReadonlyArray<UpdatedSymbolJsDoc>, UpdateError> => {
  const result = Effect.forEach((plan: MergePlan) =>
    applyMergePlan(fileResult, plan).pipe(
      Effect.map((doc) => ({
        target: plan.target,
        jsDoc: doc,
      })),
    ),
  )(plans)
  return result
}
