import { Schema } from 'effect'
import { NonDocumentableMethodMemberAnalysis } from './NonDocumentableMethodMemberAnalysis.js'
import { NonDocumentablePropertyMemberAnalysis } from './NonDocumentablePropertyMemberAnalysis.js'
import { DocumentableMemberAnalysis } from './DocumentableMemberAnalysis.js'

export type MemberAnalysis =
  | DocumentableMemberAnalysis
  | NonDocumentableMethodMemberAnalysis
  | NonDocumentablePropertyMemberAnalysis

export const MemberAnalysis = Schema.suspend(() =>
  Schema.Union([
    DocumentableMemberAnalysis,
    NonDocumentableMethodMemberAnalysis,
    NonDocumentablePropertyMemberAnalysis,
  ]),
)

// export type MemberAnalysis = Schema.Schema.Type<typeof MemberAnalysis>
