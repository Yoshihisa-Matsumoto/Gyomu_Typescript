import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { NonDocumentableMember } from './NonDocumentableMember.js'
import { BaseMemberAnalysis } from './BaseMemberAnalysis.js'
import { MemberAnalysis } from './MemberAnalysis.js'

export interface NonDocumentableMethodMemberAnalysis
  extends BaseMemberAnalysis, NonDocumentableMember {
  kind: 'method'

  parameters: ReadonlyArray<MemberAnalysis>

  returnType: TypeAnalysis | undefined

  snippet: string
}

export const NonDocumentableMethodMemberAnalysis: Schema.Schema<NonDocumentableMethodMemberAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('method'),
    parameters: Schema.Array(Schema.suspend(() => MemberAnalysis)),
    returnType: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
    snippet: Schema.String,
  })
    .pipe(
      Schema.fieldsAssign(BaseMemberAnalysis.fields),
      Schema.fieldsAssign(NonDocumentableMember.fields),
    )
    .annotate({
      description: 'Represents the analysis of a method member that is not documentable.',
    })

// export type NonDocumentableMethodMemberAnalysis = Schema.Schema.Type<
//   typeof NonDocumentableMethodMemberAnalysis
// >
