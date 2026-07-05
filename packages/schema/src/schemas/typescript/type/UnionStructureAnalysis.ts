// import { Schema } from 'effect'

// /**
//  * Represents a union type structure.
//  */
// export const UnionStructureAnalysis = Schema.Struct({
//   /**
//    * The classification of this structure.
//    */
//   kind: Schema.Literal('union').annotate({
//     description: 'The classification of this structure.',
//   }),

//   /**
//    * The member types of the union.
//    */
//   types: Schema.Array(Schema.suspend(() => TypeAnalysis)).annotate({
//     description: 'The member types of the union.',
//   }),
// }).annotate({
//   description: 'Represents a union type structure.',
// })

// export type UnionStructureAnalysis = typeof UnionStructureAnalysis.Type
