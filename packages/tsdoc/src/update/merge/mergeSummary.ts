import type { ParsedJsDoc } from '@gyomu/schema/schemas/typescript'
import type { MergeActionContext } from '../jsDoc/MergePlan.js'

/**
 * Determines the resulting JSDoc summary based on the provided merge plan and optional existing documentation.
 *
 * @param plan The merge action plan specifying the desired state (preserve, replace, or delete).
 *
 * @param existingJsDoc The optional existing JSDoc documentation to reconcile with the plan.
 *
 * @returns The resolved summary string, or undefined if the summary should be removed or is absent.
 */
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
