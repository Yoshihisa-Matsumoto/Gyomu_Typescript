// import { Schema } from 'effect'

// /**
//  * Represents an array structure.
//  */
// export const ArrayStructureAnalysis = Schema.Struct({
//   /**
//    * The classification of this structure.
//    */
//   kind: Schema.Literal('array').annotate({
//     description: 'The classification of this structure.',
//   }),

//   /**
//    * The type of the array elements.
//    */
//   elementType: Schema.suspend(() => TypeAnalysis).annotate({
//     description: 'The type of the array elements.',
//   }),
// }).annotate({
//   description: 'Represents an array structure.',
// })

// export type ArrayStructureAnalysis = typeof ArrayStructureAnalysis.Type
