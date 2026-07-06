import { Schema } from 'effect'
import { BasePropertyMemberAnalysis } from './BasePropertyMemberAnalysis.js'
import { NonDocumentableMember } from './NonDocumentableMember.js'

/**
 * Represents the analysis of a property member that is not documentable, inheriting structure from base property and non-documentable member schemas.
 */
export const NonDocumentablePropertyMemberAnalysis = Schema.Struct({})
  .pipe(
    Schema.fieldsAssign(BasePropertyMemberAnalysis.fields),
    Schema.fieldsAssign(NonDocumentableMember.fields),
  )
  .annotate({
    description: 'Represents the analysis of a property member that is not documentable.',
  })

/**
 * The inferred TypeScript type for NonDocumentablePropertyMemberAnalysis.
 */
export type NonDocumentablePropertyMemberAnalysis = Schema.Schema.Type<
  typeof NonDocumentablePropertyMemberAnalysis
>
