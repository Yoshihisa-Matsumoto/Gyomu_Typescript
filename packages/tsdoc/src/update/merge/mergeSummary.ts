import type { ParsedJsDoc } from '../../analysis/jsdoc/ParsedJsDoc.js'
import type { MergeActionContext } from '../jsdoc/MergePlan.js'

export const mergeSummary = (
  plan: MergeActionContext<string>,
  existingJsDoc?: ParsedJsDoc,
): string | undefined => {
  switch (plan.type) {
    case 'preserve':
      return existingJsDoc?.summary
    case 'delete':
      return undefined
    case 'replace':
      return plan.value
  }
}
