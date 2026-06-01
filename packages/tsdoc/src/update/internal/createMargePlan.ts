import type { JsDocUpdateContext, JsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'
import type { MergePlan } from '../jsdoc/MergePlan.js'

export const createMergePlan = (context: JsDocUpdateContext, plan: JsDocUpdatePlan): MergePlan => {
  const confidences = [
    plan.summary.confidence,
    plan.returns.confidence,
    ...plan.params.map((p) => p.confidence),
    ...plan.tags.map((t) => t.confidence),
  ]
  return {
    target: plan.identity,
    summary: plan.summary.action,
    returns: plan.returns.action,
    params: plan.params.map((param) => ({
      name: param.name,
      action: param.action,
    })),
    tags: plan.tags.map((tag) => ({
      tag: tag.tag,
      action: tag.action,
    })),
    conflicts: [],
    confidence: Math.min(...confidences),
    averageConfidence: confidences.reduce((sum, value) => sum + value, 0) / confidences.length,
  }
}
