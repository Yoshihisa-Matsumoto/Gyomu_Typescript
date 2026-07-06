import { Schema } from 'effect'
import { DocumentablePropertyMemberAnalysis } from './DocumentablePropertyMemberAnalysis.js'
import { DocumentableMethodMemberAnalysis } from './DocumentableMethodMemberAnalysis.js'

/**
 * Defines the set of member analyses that are documentable.
 */
export type DocumentableMemberAnalysis =
  DocumentableMethodMemberAnalysis | DocumentablePropertyMemberAnalysis

/**
 * Defines the Effect schema for documentable member analyses, which is a union of method and property analysis schemas.
 */
export const DocumentableMemberAnalysis = Schema.suspend(() =>
  Schema.Union([DocumentableMethodMemberAnalysis, DocumentablePropertyMemberAnalysis]),
)
