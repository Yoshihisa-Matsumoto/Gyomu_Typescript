import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { DocumentableMember } from './DocumentableMember.js'
import { BaseMemberAnalysis } from './BaseMemberAnalysis.js'
import { MemberAnalysis } from './MemberAnalysis.js'

export interface DocumentableMethodMemberAnalysis extends BaseMemberAnalysis, DocumentableMember {
  kind: 'method'

  parameters: ReadonlyArray<MemberAnalysis>

  returnType: TypeAnalysis | undefined

  snippet: string
}

export const DocumentableMethodMemberAnalysis: Schema.Schema<DocumentableMethodMemberAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('method'),
    parameters: Schema.Array(Schema.suspend(() => MemberAnalysis)),
    returnType: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
    snippet: Schema.String,
  })
    .pipe(
      Schema.fieldsAssign(BaseMemberAnalysis.fields),
      Schema.fieldsAssign(DocumentableMember.fields),
    )
    .annotate({
      description:
        'Represents the analysis of a class or object member that supports JSDoc, specifically for method members.',
    })

// export type DocumentableMethodMemberAnalysis = Schema.Schema.Type<
//   typeof DocumentableMethodMemberAnalysis
// >
