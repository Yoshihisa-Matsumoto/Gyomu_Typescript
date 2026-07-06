// import { Schema } from 'effect'
// import { TypeAnalysis } from '../type/TypeAnalysis.js'
// import { BaseMemberAnalysis } from './BaseMemberAnalysis.js'
// import { MemberAnalysis } from './MemberAnalysis.js'

// interface BaseMethodMemberAnalysis extends BaseMemberAnalysis {
//   kind: 'method'

//   parameters: ReadonlyArray<MemberAnalysis>

//   returnType: TypeAnalysis | undefined

//   snippet: string
// }

// /**
//  * Represents a non-documentable type property.
//  */
// export const BaseMethodMemberAnalysis: Schema.Schema<BaseMethodMemberAnalysis> = Schema.Struct({
//   kind: Schema.Literal('method'),
//   parameters: Schema.suspend(() => Schema.Array(MemberAnalysis)),
//   returnType: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
//   snippet: Schema.String,
// }).pipe(Schema.fieldsAssign(BaseMemberAnalysis.fields))
