import type { MemberAnalysis } from './MemberAnalysis.js'

/**
 * Supported public symbol categories.
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
   * Parameter analysis list.
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
export interface TypeAnalysis {
  text: string
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

export type TypeStructureAnalysis =
  | ObjectStructureAnalysis
  | ArrayStructureAnalysis
  | FunctionStructureAnalysis
  | UnionStructureAnalysis
  | TypeReferenceStructureAnalysis
  | PrimitiveAnalysis
  | LiteralAnalysis

export type LiteralAnalysis = {
  kind: 'literal'
  elementValue: string
}
export type PrimitiveAnalysis = {
  kind: 'primitive'
  elementType: string
}
export type ObjectStructureAnalysis = {
  kind: 'object'
  /**
   * Nested object members.
   */
  members?: Array<MemberAnalysis> | undefined
}

export type ArrayStructureAnalysis = {
  kind: 'array'

  elementType: TypeAnalysis
}

export type FunctionStructureAnalysis = {
  kind: 'function'

  parameters: Array<MemberAnalysis>

  returnType?: TypeAnalysis
}

export type UnionStructureAnalysis = {
  kind: 'union'

  types: Array<TypeAnalysis>
}

export type TypeReferenceStructureAnalysis = {
  kind: 'reference'
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
