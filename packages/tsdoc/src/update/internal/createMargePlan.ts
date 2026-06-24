import { fromSync } from '@gyomu/schema/effect'
import { equalSymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import { isJsDocTargetKind } from '@gyomu/ai-compiler/jsdoc-update'
import { UpdateError } from '../error/UpdateError.js'
import { analyzeProtectedSection } from './analyzeProtectedSection.js'
import type {
  JsDocUpdatePlan,
  MergeAction,
  ParamActionValue,
  ParamMergeAction,
} from '@gyomu/ai-compiler/jsdoc-update'
import type { MergeActionContext, MergePlan } from '../jsdoc/MergePlan.js'
import type { Effect } from 'effect'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'
import type { ProtectedSection } from '@gyomu/schema/typescript'

export const createMergePlan = (
  fileResult: FileAnalysisResult,
  plans: JsDocUpdatePlan,
): Effect.Effect<Array<MergePlan>, UpdateError> => {
  const filePath = fileResult.analysis.path
  return fromSync(UpdateError, () => ({
    filePath,
    message: 'fail to create mergePlan',
    phase: 'merge-plan' as const,
  }))(() => {
    const protectedSectionResult = analyzeProtectedSection(fileResult)
    return plans.map((plan) => {
      // console.log(plan)
      const confidences = [
        plan.summary.confidence,
        plan.returns.confidence,
        ...plan.params.map((p) => p.confidence),
        ...plan.tags.map((t) => t.confidence),
      ]
      const targetProtectedSectionResult = protectedSectionResult.find((result) =>
        equalSymbolIdentity(result.identity, plan.identity),
      )

      const createdPlan = {
        target: plan.identity,
        summary: makeMergeAction(
          filePath,
          'summary',
          plan.summary.action,
          targetProtectedSectionResult?.protectedSections,
        ),
        returns: makeMergeAction(
          filePath,
          'returns',
          plan.returns.action,
          targetProtectedSectionResult?.protectedSections,
        ),
        params: plan.params.map((param) => ({
          name: param.name,
          sortOrder: param.sortOrder,
          action: makeMergeParamAction(
            filePath,
            `param:${param.name}`,
            param.action,
            targetProtectedSectionResult?.protectedSections,
          ),
        })),
        tags: plan.tags.map((tag) => ({
          tag: tag.target,
          sortOrder: tag.sortOrder,
          action: makeMergeAction(
            filePath,
            `tag:${tag.tag}`,
            tag.action,
            targetProtectedSectionResult?.protectedSections,
          ),
        })),
        conflicts: [],
        confidence: Math.min(...confidences),
        averageConfidence: confidences.reduce((sum, value) => sum + value, 0) / confidences.length,
      } satisfies MergePlan

      if (targetProtectedSectionResult) {
        for (const section of targetProtectedSectionResult.protectedSections) {
          if (!plan.tags.find((t) => t.tag == section.targetSection)) {
            const targetSection = section.targetSection.startsWith('tag:')
              ? section.targetSection.substring('tag:'.length)
              : section.targetSection

            const targetKind = isJsDocTargetKind(targetSection) ? targetSection : 'other'

            createdPlan.tags.push({
              tag: {
                kind: targetKind,
                key: targetKind == 'other' ? targetSection : null,
              },
              sortOrder: 99,
              action: { type: 'preserve' },
            })
          }
        }
      }

      return createdPlan
    })
  })
}

const makeMergeAction = (
  filePath: string,
  place: string,
  action: MergeAction,
  protectedSections: Array<ProtectedSection> | undefined,
): MergeActionContext<string> => {
  if (!protectedSections) return action
  const targetSection = protectedSections.find((s) => s.targetSection == place)
  if (!targetSection) return action
  return { type: 'preserve' }
}

const makeMergeParamAction = (
  filePath: string,
  place: string,
  action: ParamMergeAction,
  protectedSections: Array<ProtectedSection> | undefined,
): MergeActionContext<ParamActionValue> => {
  if (!protectedSections) return makeMergeParamActionInternal(filePath, place, action)
  const targetSection = protectedSections.find((s) => s.targetSection == place)
  if (!targetSection) return makeMergeParamActionInternal(filePath, place, action)
  return { type: 'preserve' }
}

const makeMergeParamActionInternal = (
  filePath: string,
  place: string,
  action: ParamMergeAction,
): MergeActionContext<ParamActionValue> => {
  switch (action.type) {
    case 'delete':
    case 'preserve':
      return { type: action.type }
    case 'replace':
      // if (!action.value)
      //   throw new UpdateError({
      //     cause: undefined,
      //     filePath,
      //     message: `action is replace for ${action.value}, but no value to update`,
      //     phase: 'merge-plan',
      //     details: { place, action },
      //   })

      return {
        type: action.type,
        value: action.value,
      }
  }
}
