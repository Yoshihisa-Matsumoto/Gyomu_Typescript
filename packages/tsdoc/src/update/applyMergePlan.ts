import { Effect } from 'effect'
import { withOptional } from '@gyomu/schema'
import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import { UpdateError } from './error/UpdateError.js'
import { mergeTags } from './merge/mergeTags.js'
import { mergeSummary } from './merge/mergeSummary.js'
import { mergeReturns } from './merge/mergeReturns.js'
import { mergeParams } from './merge/mergeParams.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { UpdatedJsDoc } from './jsDoc/UpdatedJsDoc.js'
import type { MergePlan } from './jsDoc/MergePlan.js'
import type { UpdatedSymbolJsDoc } from './jsDoc/UpdatedSymbolJsDoc.js'

export const applyMergePlan = (
  fileResult: FileAnalysisContext,
  plan: MergePlan,
): Effect.Effect<{ updatedJsDoc: UpdatedJsDoc; indent: string }, UpdateError> => {
  return Effect.gen(function* () {
    const targetSymbolData = fileResult.metadata.symbols.get(toIdentityKey(plan.target))
    // const targetSymbol = fileResult.metadata.symbols.find((exp) => {
    //   const identity = exp.symbol.identity
    //   console.log(identity)
    //   return (
    //     identity.signatureId == plan.target.signatureId && identity.symbolId == plan.target.symbolId
    //   )
    // })
    if (!targetSymbolData) {
      // console.log(plan.target)
      return yield* Effect.fail(
        new UpdateError({
          filePath: fileResult.analysis.path,
          message: 'symbol not found',
          details: plan.target,
          cause: undefined,
          phase: 'apply-merge',
        }),
      )
    }
    // const targetSymbol = targetSymbol.symbol
    const existingJsDoc = fileResult.metadata.parsedJsDocs.get(targetSymbolData.analysis.id)
    const params = yield* mergeParams(fileResult.analysis.path, plan.params, existingJsDoc)
    const tags = yield* mergeTags(fileResult.analysis.path, plan.tags, existingJsDoc)
    const updatedJsDoc: UpdatedJsDoc = {
      examples: existingJsDoc?.examples ?? [],
      humanEditSignals: existingJsDoc?.humanEditSignals ?? [],
      protectedRegions: existingJsDoc?.protectedRegions ?? [],
      protectedSections: existingJsDoc?.protectedSections ?? [],

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
      startOffset: existingJsDoc?.startOffset ?? targetSymbolData.analysis.startOffset,
      endOffset: existingJsDoc?.endOffset ?? targetSymbolData.analysis.startOffset,
    }

    return yield* Effect.succeed({ updatedJsDoc, indent: targetSymbolData.analysis.docIndent })
  })
}

export const applyMergePlans = (
  fileResult: FileAnalysisContext,
  plans: ReadonlyArray<MergePlan>,
): Effect.Effect<ReadonlyArray<UpdatedSymbolJsDoc>, UpdateError> => {
  const result = Effect.forEach((plan: MergePlan) =>
    applyMergePlan(fileResult, plan).pipe(
      Effect.map((doc) => ({
        target: plan.target,
        jsDoc: doc.updatedJsDoc,
        indent: doc.indent,
      })),
    ),
  )(plans)
  return result
}
