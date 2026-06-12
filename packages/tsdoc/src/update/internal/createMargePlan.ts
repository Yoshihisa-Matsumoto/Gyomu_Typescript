import { fromSync } from '@gyomu/schema/effect'
import { UpdateError } from '../error/UpdateError.js'
import type {
  JsDocUpdateContext,
  JsDocUpdatePlan,
  MergeAction,
  ParamActionValue,
  ParamMergeAction,
} from '@gyomu/ai-compiler/jsdoc-update'
import type { MergeActionContext, MergePlan } from '../jsdoc/MergePlan.js'
import type { Effect } from 'effect'

export const createMergePlan = (
  filePath: string,
  context: JsDocUpdateContext,
  plans: JsDocUpdatePlan,
): Effect.Effect<Array<MergePlan>, UpdateError> => {
  return fromSync(UpdateError, () => ({
    filePath,
    message: 'fail to create mergePlan',
    phase: 'merge-plan' as const,
  }))(() => {
    return plans.map((plan) => {
      const confidences = [
        plan.summary.confidence,
        plan.returns.confidence,
        ...plan.params.map((p) => p.confidence),
        ...plan.tags.map((t) => t.confidence),
      ]
      return {
        target: plan.identity,
        summary: makeMergeAction(filePath, 'summary', plan.summary.action),
        returns: makeMergeAction(filePath, 'returns', plan.returns.action),
        params: plan.params.map((param) => ({
          name: param.name,
          sortOrder: param.sortOrder,
          action: makeMergeParamAction(filePath, `param:${param.name}`, param.action),
        })),
        tags: plan.tags.map((tag) => ({
          tag: tag.target,
          sortOrder: tag.sortOrder,
          action: makeMergeAction(filePath, `tag:${tag.tag}`, tag.action),
        })),
        conflicts: [],
        confidence: Math.min(...confidences),
        averageConfidence: confidences.reduce((sum, value) => sum + value, 0) / confidences.length,
      } satisfies MergePlan
    })
  })
}

const makeMergeAction = (
  filePath: string,
  place: string,
  action: MergeAction,
): MergeActionContext<string> => {
  return action
}

const makeMergeParamAction = (
  filePath: string,
  place: string,
  action: ParamMergeAction,
): MergeActionContext<ParamActionValue> => {
  switch (action.type) {
    case 'delete':
    case 'preserve':
      return { type: action.type }
    case 'replace':
      if (!action.value)
        throw new UpdateError({
          cause: undefined,
          filePath,
          message: `action is replace for ${action.value}, but no value to update`,
          phase: 'merge-plan',
          details: { place, action },
        })

      return {
        type: action.type,
        value: action.value as ParamActionValue,
      }
  }
}
