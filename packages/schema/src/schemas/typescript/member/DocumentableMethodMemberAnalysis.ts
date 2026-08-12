import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { FunctionBodyAnalysis } from '../FunctionBodyAnalysis.js'
import { DocumentableMember } from './DocumentableMember.js'
import { BaseMemberAnalysis } from './BaseMemberAnalysis.js'
import { MemberAnalysis } from './MemberAnalysis.js'

/**
 * Represents the analysis of a class or object method member that supports JSDoc.
 */
export interface DocumentableMethodMemberAnalysis extends BaseMemberAnalysis, DocumentableMember {
  /**
   * The literal value 'method', indicating this analysis represents a method member.
   */
  kind: 'method'

  /**
   * An array of parameter analyses for this method.
   */
  parameters: ReadonlyArray<MemberAnalysis>

  /**
   * The return type analysis for this method, if defined.
   */
  returnType: TypeAnalysis | undefined

  /**
   * The source code snippet representing this method member.
   */
  snippet: string
  /**
   * Analysis results for the implementation of the function body, when the symbol represents a function.
   */
  functionBody?: FunctionBodyAnalysis | undefined
}

/**
 * Represents the analysis of a class or object member that supports JSDoc, specifically for method members. Contains metadata such as the method kind, parameters, optional return type, and the code snippet.
 */
export const DocumentableMethodMemberAnalysis: Schema.Schema<DocumentableMethodMemberAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('method'),
    parameters: Schema.Array(Schema.suspend(() => MemberAnalysis)),
    returnType: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
    snippet: Schema.String,
    functionBody: Schema.optional(FunctionBodyAnalysis).annotate({
      description:
        'Analysis results for the implementation of the function body, when the symbol represents a function.',
    }),
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
