import { Schema } from 'effect'
import { BasePropertyMemberAnalysis } from './BasePropertyMemberAnalysis.js'
import { NonDocumentableMember } from './NonDocumentableMember.js'

export const NonDocumentablePropertyMemberAnalysis = Schema.Struct({})
  .pipe(
    Schema.fieldsAssign(BasePropertyMemberAnalysis.fields),
    Schema.fieldsAssign(NonDocumentableMember.fields),
  )
  .annotate({
    description: 'Represents the analysis of a property member that is not documentable.',
  })

export type NonDocumentablePropertyMemberAnalysis = Schema.Schema.Type<
  typeof NonDocumentablePropertyMemberAnalysis
>
