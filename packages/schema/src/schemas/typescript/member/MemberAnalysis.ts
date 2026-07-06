import { Schema } from 'effect'
import { NonDocumentableMethodMemberAnalysis } from './NonDocumentableMethodMemberAnalysis.js'
import { NonDocumentablePropertyMemberAnalysis } from './NonDocumentablePropertyMemberAnalysis.js'
import { DocumentableMemberAnalysis } from './DocumentableMemberAnalysis.js'

/**
 * Represents the analysis results for a class or interface member, which may be documentable or non-documentable.
 */
export type MemberAnalysis =
  | DocumentableMemberAnalysis
  | NonDocumentableMethodMemberAnalysis
  | NonDocumentablePropertyMemberAnalysis

/**
 * A runtime schema for validating member analysis objects.
 */
export const MemberAnalysis = Schema.suspend(() =>
  Schema.Union([
    DocumentableMemberAnalysis,
    NonDocumentableMethodMemberAnalysis,
    NonDocumentablePropertyMemberAnalysis,
  ]),
)

// export type MemberAnalysis = Schema.Schema.Type<typeof MemberAnalysis>
