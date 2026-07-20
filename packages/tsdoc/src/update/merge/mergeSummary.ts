import type { ParsedJsDoc } from '@gyomu/schema/schemas/typescript'
import type { MergeActionContext } from '../jsDoc/MergePlan.js'

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
