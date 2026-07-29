import type { JsDocReturns, ParsedJsDoc } from '@gyomu/schema/schemas/typescript'
import type { MergeActionContext } from '../jsDoc/MergePlan.js'

/**
 * Determines the resulting return documentation based on the provided merge action context and existing JSDoc.
 *
 * @param plan The merge action context containing the update type and optional value.
 *
 * @param existingJsDoc Optional existing JSDoc structure to preserve if the action type is 'preserve'.
 *
 * @returns The updated return documentation structure, or undefined if the documentation should be removed.
 */
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
