import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { NonDocumentableMember } from './NonDocumentableMember.js'
import { BaseMemberAnalysis } from './BaseMemberAnalysis.js'
import { MemberAnalysis } from './MemberAnalysis.js'

/**
 * Represents the analysis of a method member that is not documentable.
 */
export interface NonDocumentableMethodMemberAnalysis
  extends BaseMemberAnalysis, NonDocumentableMember {
  /**
   * The literal 'method' identifying this member as a method.
   */
  kind: 'method'

  /**
   * The list of parameters defined for the method.
   */
  parameters: ReadonlyArray<MemberAnalysis>

  /**
   * The analysis of the method's return type, or undefined if not explicitly defined.
   */
  returnType: TypeAnalysis | undefined

  /**
   * The source code snippet representing the method definition.
   */
  snippet: string
}

/**
 * Represents the analysis of a method member that is not documentable, containing the method's parameters, return type, and source code snippet.
 */
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
