import { withOptional } from '@gyomu/schema'
import { fromSync } from '@gyomu/schema/effect'
import { UpdateError } from '../error/UpdateError.js'
import type {
  JsDocUpdateContext,
  JsDocUpdatePlan,
  MergeAction,
} from '@gyomu/ai-compiler/jsdoc-update'
import type { MergeActionContext, MergePlan, ParamAction } from '../jsdoc/MergePlan.js'
import type { Effect } from 'effect'

export const createMergePlan = (
  filePath: string,
  context: JsDocUpdateContext,
  plan: JsDocUpdatePlan,
): Effect.Effect<MergePlan, UpdateError> => {
  return fromSync(UpdateError, () => ({
    filePath,
    message: 'fail to create mergePlan',
    phase: 'merge-plan' as const,
  }))(() => {
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
        action: makeMergeParamAction(filePath, `param:${param.name}`, param.action, param.value),
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
}

const makeMergeAction = (
  filePath: string,
  place: string,
  action: MergeAction,
): MergeActionContext<string> => {
  return action
}

type ParamValue = JsDocUpdatePlan['params'][number]['value']

const makeMergeParamAction = (
  filePath: string,
  place: string,
  action: MergeAction,
  targetValue: ParamValue,
): MergeActionContext<ParamAction> => {
  switch (action.type) {
    case 'delete':
    case 'preserve':
      return { type: action.type }
    case 'replace':
      if (!targetValue || (!targetValue.description && !targetValue.type))
        throw new UpdateError({
          cause: undefined,
          filePath,
          message: `action is ${action}, but no value to update`,
          phase: 'merge-plan',
          details: { place, action, targetValue },
        })
      return {
        type: action.type,
        value: withOptional({ description: targetValue.description, type: targetValue.type }),
      }
  }
}
