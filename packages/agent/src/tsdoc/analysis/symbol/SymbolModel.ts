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

/**
 * High-level parameter structure categories.
 */
export type ParameterStructure =
  | 'primitive'
  | 'object'
  | 'array'
  | 'function'
  | 'union'
  | 'generic'
  | 'unknown'

/**
 * Structural metrics for object-like parameters.
 */
export interface ObjectMetrics {
  /**
   * Total nested property count.
   */
  nestedPropertyCount: number

  /**
   * Maximum nesting depth.
   */
  maxDepth: number

  /**
   * Number of required properties.
   */
  requiredPropertyCount: number

  /**
   * Number of optional properties.
   */
  optionalPropertyCount: number

  /**
   * Number of union-type properties.
   */
  unionCount: number
}

/**
 * Function or callable type signature analysis.
 */
export interface SignatureAnalysis {
  /**
   * Parameter analysis list.
   */
  parameters: Array<ParameterAnalysis>

  /**
   * Return type text representation.
   */
  returnType?: string

  /**
   * Generic type parameter names.
   */
  typeParameters?: Array<string>

  /**
   * Number of overload signatures.
   */
  overloadCount?: number
}

/**
 * Detailed parameter structure analysis.
 */
export interface ParameterAnalysis {
  /**
   * Parameter identifier.
   */
  name: string

  /**
   * Parameter type text representation.
   */
  type?: string

  /**
   * Whether the parameter is optional.
   */
  optional: boolean

  /**
   * Whether the parameter is a rest parameter.
   */
  rest: boolean

  /**
   * High-level parameter structure category.
   */
  structure: ParameterStructure

  /**
   * Object-specific structural metrics.
   */
  objectMetrics?: ObjectMetrics
}
