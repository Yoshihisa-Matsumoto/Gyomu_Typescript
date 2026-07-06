// import type { TypeAnalysis } from '../schemas/typescript/type/TypeAnalysis.js'
// import type { DependencyCandidate } from '../schemas/typescript/DependencyCandidate.js'
// import type { MemberAnalysis } from '../schemas/typescript/member/MemberAnalysis.js'
// import type { SignatureId } from './types.js'

// /**
//  * Function or callable type signature analysis.
//  */
// export interface SignatureAnalysis {
//   /**
//    * Unique signature identifier, e.g. for overloads.
//    */
//   id: SignatureId

//   /**
//    * An ordered list of analyzed parameters.
//    */
//   parameters: Array<MemberAnalysis>

//   /**
//    * Return type text representation.
//    */
//   returnType?: TypeAnalysis | undefined

//   /**
//    * Generic type parameter names.
//    */
//   typeParameters?: Array<string> | undefined

//   /**
//    * Number of overload signatures.
//    */
//   overloadCount?: number | undefined

//   /**
//    * Whether this signature is the implementation of an overload set.
//    */
//   isOverloadImplementation?: boolean | undefined

//   dependencyCandidates: ReadonlyArray<DependencyCandidate>
// }
