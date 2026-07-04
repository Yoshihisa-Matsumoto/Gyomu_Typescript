// import type { SymbolIdentity } from '../../schemas/typescript/SymbolIdentity.js'

// /**
//  * Represents a marker identifying the tool and version used for generation.
//  */
// export interface GeneratorMarker {
//   /**
//    * The name of the tool used for generation.
//    */
//   tool: string

//   /**
//    * Optional version of the tool used for generation.
//    */
//   version?: string

//   /**
//    * The raw string representation of the generator marker.
//    */
//   raw: string
// }

// /**
//  * Defines a protected section of code, identified by its start and end positions, content, and optional surrounding context.
//  */
// export interface ProtectedRegion {
//   /**
//    * The starting character index of the protected region.
//    */
//   start: number

//   /**
//    * The ending character index of the protected region.
//    */
//   end: number

//   /**
//    * The text content within the protected region.
//    */
//   content: string

//   /**
//    * Optional identity of the symbol immediately preceding this region.
//    */
//   before?: SymbolIdentity | undefined

//   /**
//    * Optional identity of the symbol immediately following this region.
//    */
//   after?: SymbolIdentity | undefined
// }
