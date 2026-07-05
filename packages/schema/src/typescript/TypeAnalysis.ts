// import type { JsDocAnalysis } from '../schemas/typescript/jsdoc/JsDocAnalysis.js'
// import type { SymbolId } from './types.js'
// import type { SymbolIdentity } from '../schemas/typescript/SymbolIdentity.js'
// import type { TypeSource } from '../schemas/typescript/TypeSource.js'
// import type { ParsedJsDoc } from '../schemas/typescript/jsdoc/ParsedJsDoc.js'
// import type { LineRange } from '../schemas/typescript/LineRange.js'

// /**
//  * Represents the analysis of a TypeScript type, including its text representation, origin, structural details, and any associated Effect-related signals.
//  */
// export interface TypeAnalysis {
//   /**
//    * The string representation of the type.
//    */
//   text: string

//   /**
//    * The source system that generated the type analysis.
//    */
//   source: TypeSource

//   /**
//    * Nested object members.
//    */
//   structure?: TypeStructureAnalysis | undefined

//   /**
//    * Effect-related semantic signals.
//    */
//   effect?: EffectSignals | undefined
// }

// /**
//  * Defines semantic signals for an Effect type, capturing success, error, and requirement dependencies.
//  */
// export interface EffectSignals {
//   /**
//    * Whether the symbol returns an Effect.
//    */
//   returnsEffect: boolean

//   /**
//    * Success value type.
//    */
//   success: TypeAnalysis

//   /**
//    * Error type.
//    */
//   error: TypeAnalysis | undefined

//   /**
//    * Required context/environment type.
//    */
//   requirements: TypeAnalysis | undefined

//   /**
//    * Whether the Effect contains an error type.
//    */
//   hasErrorType: boolean

//   /**
//    * Whether the Effect contains requirements/context type.
//    */
//   hasRequirementsType: boolean

//   /**
//    * Estimated Effect nesting depth.
//    */
//   effectDepth: number | undefined
// }

// /**
//  * Represents the structural breakdown of a type.
//  */
// export type TypeStructureAnalysis =
//   | ObjectStructureAnalysis
//   | ArrayStructureAnalysis
//   | FunctionStructureAnalysis
//   | UnionStructureAnalysis
//   | TypeReferenceStructureAnalysis
//   | PrimitiveAnalysis
//   | LiteralAnalysis

// /**
//  * Represents a literal type value.
//  */
// export type LiteralAnalysis = {
//   /**
//    * The classification of this structure.
//    */
//   kind: 'literal'

//   /**
//    * The literal value.
//    */
//   elementValue: string
// }

// /**
//  * Represents a primitive type.
//  */
// export type PrimitiveAnalysis = {
//   /**
//    * The classification of this structure.
//    */
//   kind: 'primitive'

//   /**
//    * The name of the primitive type.
//    */
//   elementType: string
// }

// /**
//  * Represents an object structure.
//  */
// export type ObjectStructureAnalysis = {
//   /**
//    * The classification of this structure.
//    */
//   kind: 'object'

//   /**
//    * Nested object members.
//    */
//   members: Array<TypeProperty> | undefined
// }

// /**
//  * Represents an array structure.
//  */
// export type ArrayStructureAnalysis = {
//   /**
//    * The classification of this structure.
//    */
//   kind: 'array'

//   /**
//    * The type of the array elements.
//    */
//   elementType: TypeAnalysis
// }

// /**
//  * Represents a function type structure.
//  */
// export type FunctionStructureAnalysis = {
//   /**
//    * The classification of this structure.
//    */
//   kind: 'function'

//   /**
//    * Function parameters.
//    */
//   parameters: Array<TypeProperty>

//   /**
//    * The function's return type.
//    */
//   returnType: TypeAnalysis
// }

// /**
//  * Represents a union type structure.
//  */
// export type UnionStructureAnalysis = {
//   /**
//    * The classification of this structure.
//    */
//   kind: 'union'

//   /**
//    * The member types of the union.
//    */
//   types: Array<TypeAnalysis>
// }

// /**
//  * Represents a reference to another type identifier.
//  */
// export type TypeReferenceStructureAnalysis = {
//   /**
//    * The classification of this structure.
//    */
//   kind: 'reference'

//   /**
//    * The identifier of the referenced type.
//    */
//   targetId: string
// }

// export type TypeProperty = NonDocumentableTypeProperty | DocumentableTypeProperty

// interface TypePropertyBase {
//   /**
//    * Stable identifier of the symbol.
//    *
//    * @remarks
//    * This identifier must remain stable across repeated analyses of the same source code.
//    * It is used as a correlation key for generated documentation, merge operations,
//    * snapshots, and other analysis artifacts.
//    *
//    * Recommended format:
//    *
//    * ```text
//    * <relative-file-path>::<qualified-symbol-name>
//    * ```
//    *
//    * Example:
//    *
//    * ```text
//    * src/user/UserService.ts::UserService.getUser
//    * ```
//    */
//   id: SymbolId

//   /**
//    * Symbol name/identity details.
//    */
//   identity: SymbolIdentity

//   name: string

//   type: TypeAnalysis | undefined

//   optional: boolean

//   readonly: boolean

//   rest: boolean

//   declarationOrder: number
// }

// export interface NonDocumentableTypeProperty extends TypePropertyBase {
//   /**
//    * Indicates that this member is documentable.
//    */
//   documentable: false
// }
// export interface DocumentableTypeProperty extends TypePropertyBase {
//   /**
//    * Indicates that this member is documentable.
//    */
//   documentable: true

//   /**
//    * Contains the structured JSDoc analysis.
//    */
//   jsDoc: JsDocAnalysis | undefined

//   /**
//    * A collection of parsed JSDoc/TSDoc elements.
//    */
//   parsedJsDoc: Array<ParsedJsDoc> | undefined

//   /**
//    * The location information of the symbol within the source code.
//    */
//   location: LineRange

//   /**
//    * The character offset where the symbol starts.
//    */
//   startOffset: number
// }
