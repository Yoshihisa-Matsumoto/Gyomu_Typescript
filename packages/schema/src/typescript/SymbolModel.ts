import type { MemberAnalysis } from './MemberAnalysis.js'

/**
 * Categorizes the type of a public symbol.
 */
export type SymbolKind =
  | 'interface'
  | 'type'
  | 'class'
  | 'function'
  | 'const'
  | 'enum'
  | 'namespace'

// /**
//  * Structural metrics for object-like parameters.
//  */
// export interface ObjectMetrics {
//   /**
//    * Total nested property count.
//    */
//   nestedPropertyCount: number

//   /**
//    * Maximum nesting depth.
//    */
//   maxDepth: number

//   /**
//    * Number of required properties.
//    */
//   requiredPropertyCount: number

//   /**
//    * Number of optional properties.
//    */
//   optionalPropertyCount: number

//   /**
//    * Number of union-type properties.
//    */
//   unionCount: number
// }

/**
 * Function or callable type signature analysis.
 */
export interface SignatureAnalysis {
  /**
   * Unique signature identifier, e.g. for overloads.
   */
  id: string

  /**
   * An ordered list of analyzed parameters.
   */
  parameters: Array<MemberAnalysis>

  /**
   * Return type text representation.
   */
  returnType?: TypeAnalysis

  /**
   * Generic type parameter names.
   */
  typeParameters?: Array<string>

  /**
   * Number of overload signatures.
   */
  overloadCount?: number

  /**
   * Whether this signature is the implementation of an overload set.
   */
  isOverloadImplementation?: boolean
}

// /**
//  * Detailed parameter structure analysis.
//  */
// export interface ParameterAnalysis {
//   /**
//    * Parameter identifier.
//    */
//   name: string

//   /**
//    * Parameter type text representation.
//    */
//   type?: TypeAnalysis

//   /**
//    * Whether the parameter is optional.
//    */
//   optional: boolean

//   /**
//    * Whether the parameter is a rest parameter.
//    */
//   rest: boolean

//   /**
//    * Object-specific structural metrics.
//    */
//   objectMetrics?: ObjectMetrics
// }

/**
 * Represents the analysis of a TypeScript type, including its text representation, origin, structural details, and any associated Effect-related signals.
 */
export interface TypeAnalysis {
  /**
   * The string representation of the type.
   */
  text: string

  /**
   * The source system that generated the type analysis.
   */
  source: 'typescript' | 'effect-schema'

  /**
   * Nested object members.
   */
  structure?: TypeStructureAnalysis | undefined

  /**
   * Effect-related semantic signals.
   */
  effect?: EffectSignals
}

/**
 * Defines semantic signals for an Effect type, capturing success, error, and requirement dependencies.
 */
export interface EffectSignals {
  /**
   * Whether the symbol returns an Effect.
   */
  returnsEffect: boolean

  /**
   * Success value type.
   */
  success: TypeAnalysis

  /**
   * Error type.
   */
  error: TypeAnalysis | undefined

  /**
   * Required context/environment type.
   */
  requirements: TypeAnalysis | undefined

  /**
   * Whether the Effect contains an error type.
   */
  hasErrorType: boolean

  /**
   * Whether the Effect contains requirements/context type.
   */
  hasRequirementsType: boolean

  /**
   * Estimated Effect nesting depth.
   */
  effectDepth?: number
}

/**
 * Represents the structural breakdown of a type.
 */
export type TypeStructureAnalysis =
  | ObjectStructureAnalysis
  | ArrayStructureAnalysis
  | FunctionStructureAnalysis
  | UnionStructureAnalysis
  | TypeReferenceStructureAnalysis
  | PrimitiveAnalysis
  | LiteralAnalysis

/**
 * Represents a literal type value.
 */
export type LiteralAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'literal'

  /**
   * The literal value.
   */
  elementValue: string
}

/**
 * Represents a primitive type.
 */
export type PrimitiveAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'primitive'

  /**
   * The name of the primitive type.
   */
  elementType: string
}

/**
 * Represents an object structure.
 */
export type ObjectStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'object'

  /**
   * Nested object members.
   */
  members?: Array<MemberAnalysis> | undefined
}

/**
 * Represents an array structure.
 */
export type ArrayStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'array'

  /**
   * The type of the array elements.
   */
  elementType: TypeAnalysis
}

/**
 * Represents a function type structure.
 */
export type FunctionStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'function'

  /**
   * Function parameters.
   */
  parameters: Array<MemberAnalysis>

  /**
   * The function's return type.
   */
  returnType?: TypeAnalysis
}

/**
 * Represents a union type structure.
 */
export type UnionStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'union'

  /**
   * The member types of the union.
   */
  types: Array<TypeAnalysis>
}

/**
 * Represents a reference to another type identifier.
 */
export type TypeReferenceStructureAnalysis = {
  /**
   * The classification of this structure.
   */
  kind: 'reference'

  /**
   * The identifier of the referenced type.
   */
  targetId: string
}
// /**
//  * High-level parameter structure categories.
//  */
// export type ParameterStructure =
//   | 'primitive'
//   | 'object'
//   | 'array'
//   | 'function'
//   | 'union'
//   | 'generic'
//   | 'unknown'
