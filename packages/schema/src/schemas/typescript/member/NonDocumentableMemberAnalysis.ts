import { Schema } from 'effect'
import { NonDocumentableMethodMemberAnalysis } from './NonDocumentableMethodMemberAnalysis.js'
import { NonDocumentablePropertyMemberAnalysis } from './NonDocumentablePropertyMemberAnalysis.js'

/**
 * Defines the set of member analyses that are non-documentable.
 */
export type NonDocumentableMemberAnalysis =
  NonDocumentableMethodMemberAnalysis | NonDocumentablePropertyMemberAnalysis

/**
 * An Effect Schema representing the union of non-documentable method and property member analyses.
 */
export const NonDocumentableMemberAnalysis = Schema.suspend(() =>
  Schema.Union([NonDocumentableMethodMemberAnalysis, NonDocumentablePropertyMemberAnalysis]),
)
