import { Schema } from 'effect'
import { BasePropertyMemberAnalysis } from './BasePropertyMemberAnalysis.js'
import { DocumentableMember } from './DocumentableMember.js'

/**
 * Represents the analysis of a class or object member that supports JSDoc, specifically for property members.
 */
export const DocumentablePropertyMemberAnalysis = Schema.Struct({})
  .pipe(
    Schema.fieldsAssign(BasePropertyMemberAnalysis.fields),
    Schema.fieldsAssign(DocumentableMember.fields),
  )
  .annotate({
    description:
      'Represents the analysis of a class or object member that supports JSDoc, specifically for property members.',
  })

/**
 * Represents the inferred type of DocumentablePropertyMemberAnalysis.
 */
export type DocumentablePropertyMemberAnalysis = Schema.Schema.Type<
  typeof DocumentablePropertyMemberAnalysis
>
