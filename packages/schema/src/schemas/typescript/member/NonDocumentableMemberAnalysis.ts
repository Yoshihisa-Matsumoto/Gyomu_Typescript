import { Schema } from 'effect'
import { NonDocumentableMethodMemberAnalysis } from './NonDocumentableMethodMemberAnalysis.js'
import { NonDocumentablePropertyMemberAnalysis } from './NonDocumentablePropertyMemberAnalysis.js'

/**
 * Defines the set of member analyses that are documentable.
 */
export type NonDocumentableMemberAnalysis =
  NonDocumentableMethodMemberAnalysis | NonDocumentablePropertyMemberAnalysis

export const NonDocumentableMemberAnalysis = Schema.suspend(() =>
  Schema.Union([NonDocumentableMethodMemberAnalysis, NonDocumentablePropertyMemberAnalysis]),
)
