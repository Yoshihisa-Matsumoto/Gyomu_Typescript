import { Schema } from 'effect'
import { DocumentablePropertyMemberAnalysis } from './DocumentablePropertyMemberAnalysis.js'
import { DocumentableMethodMemberAnalysis } from './DocumentableMethodMemberAnalysis.js'

/**
 * Defines the set of member analyses that are documentable.
 */
export type DocumentableMemberAnalysis =
  DocumentableMethodMemberAnalysis | DocumentablePropertyMemberAnalysis

export const DocumentableMemberAnalysis = Schema.suspend(() =>
  Schema.Union([DocumentableMethodMemberAnalysis, DocumentablePropertyMemberAnalysis]),
)
