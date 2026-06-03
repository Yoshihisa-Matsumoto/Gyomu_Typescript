import type { JsDocReturns, ParsedJsDoc } from '../../analysis/jsdoc/ParsedJsDoc.js'
import type { MergeActionContext } from '../jsdoc/MergePlan.js'

export const mergeReturns = (
  plan: MergeActionContext<string>,
  existingJsDoc?: ParsedJsDoc,
): JsDocReturns | undefined => {
  switch (plan.type) {
    case 'preserve':
      return existingJsDoc?.returns
    case 'delete':
      return undefined
    case 'replace':
      return { description: plan.value }
  }
}
